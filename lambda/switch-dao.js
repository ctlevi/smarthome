'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const docClient = new AWS.DynamoDB.DocumentClient();
const iotdata = new AWS.IotData({endpoint: 	'a32nfefyjs2m0f.iot.us-west-2.amazonaws.com'});

const fullScanParams = {
  TableName : 'switches'
};

exports.getSwitches = function() {
  return new Promise((resolve, reject) => {
    docClient.scan(fullScanParams, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data.Items)
    });
  });
};

exports.getSwitch = function(id) {
  const params = {
    TableName : 'switches',
    Key: {
      id: id
    }
  };

  return new Promise((resolve, reject) => {
    docClient.get(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data.Item);
    });
  });
};

function getSwitchStatusParams(switchItem, status) {
  return {
    topic: 'lights',
    payload: JSON.stringify({ code: switchItem.codes[status] })
  };
}

function getStatusFromRange(now, startTimeString, endTimeString) {
  const dateString = now.toISOString().split('T')[0];
  const start = new Date(`${dateString} ${startTimeString}`);
  const end = new Date(`${dateString} ${endTimeString}`);

  if (start > end) {
    if (now < end) {
      return 'on';
    } else {
      end.setTime( end.getTime() + 86400000 );
    }
  }

  if (start < now && end > now) {
    return 'on';
  } else {
    return 'off';
  }
}

function test() {
  console.log('for time between 15:00 and 04:00');
  console.log('13:00 should be off', 'off' === getStatusFromRange(new Date('2016-01-01 13:00Z'), '15:00Z', '04:00Z'));
  console.log('15:00 should be off', 'off' === getStatusFromRange(new Date('2016-01-01 15:00Z'), '15:00Z', '04:00Z'));
  console.log('16:00 should be on', 'on' === getStatusFromRange(new Date('2016-01-01 16:00Z'), '15:00Z', '04:00Z'));
  console.log('23:59:59.999 should be on', 'on' === getStatusFromRange(new Date('2016-01-01 23:59:59.999Z'), '15:00Z', '04:00Z'));
  console.log('00:00 should be on', 'on' === getStatusFromRange(new Date('2016-01-01 00:00Z'), '15:00Z', '04:00Z'));
  console.log('01:00 should be on', 'on' === getStatusFromRange(new Date('2016-01-01 01:00Z'), '15:00Z', '04:00Z'));
  console.log('05:00 should be off', 'off' === getStatusFromRange(new Date('2016-01-01 05:00Z'), '15:00Z', '04:00Z'));

  console.log('for time bewteen 04:00 and 06:00');
  console.log('03:00 should be off', 'off' === getStatusFromRange(new Date('2016-01-01 03:00Z'), '04:00Z', '06:00Z'));
  console.log('05:00 should be on', 'on' === getStatusFromRange(new Date('2016-01-01 05:00Z'), '04:00Z', '06:00Z'));
  console.log('07:00 should be off', 'off' === getStatusFromRange(new Date('2016-01-01 07:00Z'), '04:00Z', '06:00Z'));
}

exports.refreshSwitches = function() {
  return exports.getSwitches().then((switches) => {
    const now = new Date();
    switches.map((item) => {
      if (item.onRange) {
        return { switchItem: item, status: getStatusFromRange(now, item.onRange.start, item.onRange.end) };
      } else {
        return { switchItem: item, status: item.status };
      }
    }).forEach((item) => {
      const params = getSwitchStatusParams(item.switchItem, item.status);
      iotdata.publish(params, function(err, data){
        if(err) {
          console.log(err);
        }
        console.log(`Turned switch with id ${item.switchItem.id} to ${item.status} using code ${params.payload}`);
      });
    });
  });
};

function updateSwitchReal(id, status) {
  return exports.getSwitch(id).then((switchItem) => {
    const params = getSwitchStatusParams(switchItem, status);
    iotdata.publish(params, function (err, data) {
      if (err) {
        console.log(err);
      }
      console.log(`Turned switch with id ${id} to ${status} using code ${params.payload}`);
    });
  });
}

function updateSwitchDDB(id, status) {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: 'switches',
      Key: {id: id},
      AttributeUpdates: {
        status: {
          Action: 'PUT',
          Value: status
        }
      }
    };

    docClient.update(params, function (err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

exports.updateSwitchStatus = function(id, status) {
  // TODO deal with results, bluebird says it returns an array with the values resolved
  return Promise.all([updateSwitchDDB(id, status), updateSwitchReal(id, status)]);
};