import * as AWS from 'aws-sdk';
import * as moment from 'moment';
import { Switch, Status } from './interfaces/switch';
import { promisify } from './utils';

const iotdata = new (AWS as any).IotData({endpoint: 'a32nfefyjs2m0f.iot.us-west-2.amazonaws.com'});
const LIGHTS_TOPIC = 'lights';
const THING_NAME = 'RaspberryPi';

export function publishSwitchMessage(switchItem: Switch, status: Status): Promise<boolean> {
  const params = getSwitchStatusParams(switchItem, status);
  return promisify(iotdata.publish.bind(iotdata), params)
    .then(() => {
      console.log(`Turned switch with id ${switchItem.id} to ${status} using code ${params.payload}`);
      return true;
    });
}

function getSwitchStatusParams(switchItem: Switch, status: Status): { topic: string, payload: string } {
  return {
    topic: LIGHTS_TOPIC,
    payload: JSON.stringify({ code: switchItem.codes[status] })
  };
}

interface DeviceStatus {
  lastPingTime: number,
  minutesSinceLastPing: string
}

export function getDeviceStatus(): Promise<DeviceStatus> {
  return promisify(iotdata.getThingShadow.bind(iotdata), { thingName: THING_NAME })
    .then((result) => {
      const reportedState = JSON.parse(result.payload).state.reported;
      return {
        lastPingTime: reportedState.pingTime,
        minutesSinceLastPing: moment().diff(moment(reportedState.pingTime), 'minutes')
      }
    });
}
