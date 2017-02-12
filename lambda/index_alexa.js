'use strict';

// Set region to us-west-2 b/c I set everything up there...
const AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});

const switchDao = require('./switch-dao');
exports.handler = function(event, context, callback) {
  console.log(event);
  if (!event.request || !event.request.intent || !event.request.intent.slots) {
    return callback(null, buildResponse(`The request was not formatted correctly, there are no slots`));
  }
  if (!event.request.intent.slots.switch || !event.request.intent.slots.status) {
    return callback(null, buildResponse(`The request was not formatted correctly, the switch or status is not present`));
  }
  const mySwitch = event.request.intent.slots.switch.value;
  const status = event.request.intent.slots.status.value;
  console.log('The switch value was', mySwitch);
  console.log('The status value was', status);

  const switches = {
    'bedroom': '6ddb3db0-a7f3-43fb-a199-40ad911fe548',
    'living room': '47a0b823-a3e9-4d46-9a88-08a10340cc8e',
    'office': '547e696b-4363-46c4-9643-0aa0a5aa72be'
  };

  if (!switches[mySwitch]) {
    return callback(null, buildResponse('The switch was not one of the possible switches. Try bedroom, living room, or office.'));
  }

  if (!(status === 'on' || status === 'off')) {
    return callback(null, buildResponse('The status was not one of the possible statuses. Try on or off.'));
  }

  switchDao.updateSwitchStatus(switches[mySwitch], status)
    .then(result => callback(null, buildResponse(`Thanks for turning the ${mySwitch} ${status}`)))
    .catch(err => callback(buildResponse('You done screwed up')));
};

function buildResponse(message) {
  return {
    version: '1.0',
    response: {
      outputSpeech: {
        type: "PlainText",
        text: message
      }
    }
  };
}