'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const iotdata = new AWS.IotData({endpoint: 	'a32nfefyjs2m0f.iot.us-west-2.amazonaws.com'});
const moment = require('moment');

const LIGHTS_TOPIC = 'lights';
const THING_NAME = 'RaspberryPi';

exports.getDeviceStatus = function() {
  return new Promise((resolve, reject) => {
    iotdata.getThingShadow({ thingName: THING_NAME }, function(err, data) {
      if (err) {
        return reject(err);
      } else {
        const reportedState = JSON.parse(data.payload).state.reported;
        return resolve({
          lastPingTime: reportedState.pingTime,
          minutesSinceLastPing: moment().diff(moment(reportedState.pingTime), 'minutes')
        });
      }
    });
  });
};

exports.publishSwitchMessage = function(switchItem, status) {
  const params = getSwitchStatusParams(switchItem, status);
  iotdata.publish(params, function (err, data) {
    if (err) {
      console.log(err);
    }
    console.log(`Turned switch with id ${switchItem.id} to ${status} using code ${params.payload}`);
  });
};

function getSwitchStatusParams(switchItem, status) {
  return {
    topic: LIGHTS_TOPIC,
    payload: JSON.stringify({ code: switchItem.codes[status] })
  };
}

