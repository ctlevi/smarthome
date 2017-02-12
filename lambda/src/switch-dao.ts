import * as AWS from 'aws-sdk';
import { publishSwitchMessage } from './iot-dao';
import { Switch, Status } from './interfaces/switch';
import { promisify } from './utils';

const docClient = new AWS.DynamoDB.DocumentClient();

export function getSwitches(): Promise<Switch[]> {
  const fullScanParams: AWS.DynamoDB.ScanParam = {
    TableName: 'switches'
  };
  return promisify(docClient.scan.bind(docClient), fullScanParams)
    .then((result) => result.Items);
}

export function getSwitch(id: string): Promise<Switch> {
  const params: AWS.DynamoDB.GetParam = {
    TableName : 'switches',
    Key: {
      id: id
    }
  };
  return promisify(docClient.get.bind(docClient), params)
    .then((result) => result.Item);
}

export function updateSwitchStatus(id: string, status: Status): Promise<boolean[]> {
  return Promise.all([updateSwitchDDB(id, status), updateSwitchReal(id, status)]);
}

async function updateSwitchReal(id: string, status: Status): Promise<boolean> {
  const switchItem = await getSwitch(id);
  return publishSwitchMessage(switchItem, status);
}

function updateSwitchDDB(id: string, status: Status): Promise<boolean> {
  const params: AWS.DynamoDB.UpdateParam = {
    TableName: 'switches',
    Key: {id: id},
    AttributeUpdates: {
      status: {
        Action: 'PUT' as 'PUT',
        Value: status
      }
    }
  };
  return promisify(docClient.update.bind(docClient), params)
    .then((result) => true);
}

export function refreshSwitches() {
  return getSwitches().then((switches) =>
    Promise.all(switches.map((switchItem) => publishSwitchMessage(switchItem, switchItem.status)))
  );
}
