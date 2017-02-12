import * as AWS from 'aws-sdk';
// Set region to us-west-2 b/c I set everything up there...
(AWS as any).config.update({ region:'us-west-2' });

import * as switchDao from './switch-dao';
import { Switch } from './interfaces/switch';

export async function handler(event: any, context: any, callback: any) {
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

  try {
    const switches = await switchDao.getSwitches();
    const foundSwitch = switches.find((switchItem) => switchItem.alexaSpeakWord === mySwitch);
    console.log(foundSwitch);

    if (!foundSwitch) {
      return callback(null, buildResponse('The switch was not one of the possible switches. Try bedroom, living room, or office.'));
    }

    if (!(status === 'on' || status === 'off')) {
      return callback(null, buildResponse('The status was not one of the possible statuses. Try on or off.'));
    }

    await switchDao.updateSwitchStatus(foundSwitch.id, status);
    return callback(null, buildResponse(`I turned the ${mySwitch} ${status}`))
  } catch (err) {
    console.log('no we failed');
    console.log(err);
    return callback(buildResponse('You done screwed up'));
  }
}



function buildResponse(message: string) {
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
