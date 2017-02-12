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

export function getSchedule(switchId: string): Promise<Schedule> {
  // There should only be one group of rules (one on and one off rule) so just get the first of the list
  return getSchedulesByPrefix(`${RULE_PREFIX}_${switchId}`)
    .then((results) => results ? results[0] : null);
}

function getSchedulesByPrefix(rulePrefix: string): Promise<Schedule[]> {
  return promisify(cloudwatchEvents.listRules.bind(cloudwatchEvents), { NamePrefix: rulePrefix })
    .then(data=> {
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
    });
}
