import * as moment from 'moment';
import { Status } from './switch';

export interface Schedule {
  switchId: string,
  onTime: string,
  offTime: string,
}

export class Rule {
  id:string;
  status: Status;
  time:string;

  constructor(cloudwatchRule: any) {
    const splitName = cloudwatchRule.Name.split('_');
    this.id = splitName[2]; // Skipping over LIGHT and SCHEDULE
    this.status = splitName[3];
    this.time = Rule.convertCronExpressionToTime(cloudwatchRule.ScheduleExpression)
  }

  private static convertCronExpressionToTime(expression: string) {
    const regexResult = /cron\((.*)\)/.exec(expression);
    if (!regexResult) {
      throw Error(`CloudWatch rule does not contain cron expression, but instead contains ${expression}`)
    }
    const expressionArgs = regexResult[1].split(' ');
    // We only support going down to the minute. We only have multiple minutes b/c of retries in case of lights failing
    // on one of the turn on/off calls, so just grab the first one
    const minute = expressionArgs[0].split(',')[0];
    const hour = expressionArgs[1];
    return moment(`${hour}:${minute}`, 'HH:mm').format('HH:mm');
  }
}

