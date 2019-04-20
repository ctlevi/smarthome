import * as AWS from "aws-sdk";
import * as moment from "moment";
import { Switch, Status } from "./interfaces/switch";
import { promisify } from "./utils";
import config from "./config";

const iotdata = new (AWS as any).IotData({
  endpoint: config.iotEndpointAddress
});
const LIGHTS_TOPIC = "lights";
const THING_NAME = process.env.THING_NAME;

export async function publishSwitchMessage(
  switchItem: Switch,
  status: Status
): Promise<boolean> {
  const params = getSwitchStatusParams(switchItem, status);
  await promisify(iotdata.publish.bind(iotdata), params);
  console.log(
    `Turned switch with id ${switchItem.id} to ${status} using code ${
      params.payload
    }`
  );
  return true;
}

function getSwitchStatusParams(
  switchItem: Switch,
  status: Status
): { topic: string; payload: string } {
  return {
    topic: LIGHTS_TOPIC,
    payload: JSON.stringify({ code: switchItem.codes[status] })
  };
}

interface DeviceStatus {
  lastPingTime: number;
  minutesSinceLastPing: string;
}

export async function getDeviceStatus(): Promise<DeviceStatus> {
  let result = await promisify(iotdata.getThingShadow.bind(iotdata), {
    thingName: THING_NAME
  });
  const reportedState = JSON.parse(result.payload).state.reported;
  return {
    lastPingTime: reportedState.pingTime,
    minutesSinceLastPing: moment()
      .diff(moment(reportedState.pingTime), "minutes")
      .toString()
  };
}
