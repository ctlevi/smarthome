'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const moment = require('moment');
const AWS = require('aws-sdk');
const cloudwatchEvents = new AWS.CloudWatchEvents();

const GRAPHQL_LAMBDA_ARN = 'arn:aws:lambda:us-west-2:717144430326:function:SmartHomeGraphQL';
const RULE_PREFIX = 'LIGHT_SCHEDULE';

exports.getSchedules = function() {
  return getSchedules(RULE_PREFIX);
};

exports.getSchedule = function(switchId) {
  // There should only be one group of rules (one on and one off rule) so just get the first of the list
  return getSchedules(`${RULE_PREFIX}_${switchId}`)
    .then((results) => results ? results[0] : null);
};

const getSchedules = function(rulePrefix) {
  return new Promise((resolve, reject) => {
    cloudwatchEvents.listRules({NamePrefix: rulePrefix}, function(err, data) {
      if (err) {
        return reject(err);
      }
      const converted = data.Rules.map(function(rule) {
        const splitName = rule.Name.split('_');
        const id = splitName[2]; // Skipping over LIGHT and SCHEDULE
        const status = splitName[3];
        return { id: id, status: status, time: convertCronExpressionToTime(rule.ScheduleExpression) }
      });

      const result = _.values(_.groupBy(converted, 'id')).map(function(rules) {
        let onRule, offRule;
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

      return resolve(result);
    });
  });
};

function convertCronExpressionToTime(expression) {
  const expressionArgs = /cron\((.*)\)/.exec(expression)[1].split(' ');
  // We only support going down to the minute. We only have multiple minutes b/c of retries in case of lights failing
  // on one of the turn on/off calls, so just grab the first one
  const minute = expressionArgs[0].split(',')[0];
  const hour = expressionArgs[1];
  return moment(`${hour}:${minute}`, 'HH:mm').format('HH:mm');
}