import * as AWS from 'aws-sdk';
import * as _ from 'lodash';
import { promisify } from './utils';
import { Schedule, Rule } from './interfaces/schedule';
import { Status } from './interfaces/switch';

const cloudwatchEvents = new (AWS as any).CloudWatchEvents();
//const GRAPHQL_LAMBDA_ARN = 'arn:aws:lambda:us-west-2:717144430326:function:SmartHomeGraphQL';
const RULE_PREFIX = 'LIGHT_SCHEDULE';

export function getSchedules(): Promise<Schedule[]> {
  return getSchedulesByPrefix(RULE_PREFIX);
}

export async function getSchedule(switchId: string): Promise<Schedule | null> {
  // There should only be one group of rules (one on and one off rule) so just get the first of the list
  const results = await getSchedulesByPrefix(`${RULE_PREFIX}_${switchId}`)
  return results.length > 0 ? results[0] : null;
}

async function getSchedulesByPrefix(rulePrefix: string): Promise<Schedule[]> {
  let data = await promisify(cloudwatchEvents.listRules.bind(cloudwatchEvents), { NamePrefix: rulePrefix })

  const converted: Rule[] = data.Rules.map((rule: any) => new Rule(rule));
  return _.values(_.groupBy(converted, 'id')).map(function(rules) {
    let onRule: Rule, offRule: Rule;
    if (rules[0].status === 'on') {
      onRule = rules[0];
      offRule = rules[1];
    } else {
      onRule = rules[1];
      offRule = rules[0];
    }

    return {
      switchId: onRule.id,
      onTime: onRule.time,
      offTime: offRule.time
    };
  });
}
