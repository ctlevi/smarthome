'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const docClient = new AWS.DynamoDB.DocumentClient();
const iotDao = require('./iot-dao');

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

exports.refreshSwitches = function() {
  return exports.getSwitches().then((switches) => {
    switches.forEach((item) => iotDao.publishSwitchMessage(item, item.status));
  });
};

exports.updateSwitchStatus = function(id, status) {
  // TODO deal with results, bluebird says it returns an array with the values resolved
  return Promise.all([updateSwitchDDB(id, status), updateSwitchReal(id, status)]);
};

function updateSwitchReal(id, status) {
  return exports.getSwitch(id).then((switchItem) => {
    iotDao.publishSwitchMessage(switchItem, status);
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

