'use strict';

const G = require('graphql');
const switchDao = require('./switch-dao');
const iotDao = require('./iot-dao');
const schedules = require('./schedules');

const Schedule = new G.GraphQLObjectType({
  name: 'schedule',
  description: 'Schedule of when a switch turns on and off',
  fields: () => ({
    switchId: {type: G.GraphQLString},
    onTime: {type: G.GraphQLString},
    offTime: {type: G.GraphQLString}
  })
});

const Switch = new G.GraphQLObjectType({
  name: "switch",
  description: "Switch corresponding to a single remote switch outlet",
  fields: () => ({
    id: {type: G.GraphQLString},
    number: {type: G.GraphQLInt},
    purpose: {type: G.GraphQLString},
    status: {type: G.GraphQLString}, // TODO check out enum type
    schedule: {
      type: Schedule,
      resolve: function(switchItem) {
        return schedules.getSchedule(switchItem.id);
      }
    }
  })
});

const IotStatus = new G.GraphQLObjectType({
  name: 'iotStatus',
  description: 'A status object for the iot device controlling the switches',
  fields: () => ({
    lastPingTime: {type: G.GraphQLString},
    minutesSinceLastPing: {type: G.GraphQLInt}
  })
});

const Query = new G.GraphQLObjectType({
  name: 'SmartHomeSchema',
  description: "Root of the SmartHome Schema",
  fields: () => ({
    switches: {
      type: new G.GraphQLList(Switch),
      description: "List of switches in the home",
      resolve: function() {
        return switchDao.getSwitches();
      }
    },
    switch: {
      type: Switch,
      description: "Get a specific switch by id",
      args: {
        id: {type: new G.GraphQLNonNull(G.GraphQLString)}
      },
      resolve: function(source, args) {
        return switchDao.getSwitch(args.id);
      }
    },
    schedules: {
      type: new G.GraphQLList(Schedule),
      description: "List of schedules we have for switches",
      resolve: function() {
        return schedules.getSchedules();
      }
    },
    iotStatus: {
      type: IotStatus,
      description: "Current IoT device status",
      resolve: function() {
        return iotDao.getDeviceStatus();
      }
    }
  })
});

const Mutuation = new G.GraphQLObjectType({
  name: 'SmartHomeMutations',
  fields: {
    refreshSwitches: {
      type: G.GraphQLString,
      description: "Makes real life switches match the dynamodb table",
      resolve: function() {
        return switchDao.refreshSwitches();
      }
    },
    updateSwitchStatus: {
      type: G.GraphQLString,
      description: "Update a switch's status in DDB and real life",
      args: {
        id: {type: new G.GraphQLNonNull(G.GraphQLString)},
        status: {type: new G.GraphQLNonNull(G.GraphQLString)}
      },
      resolve: function(source, args) {
        return switchDao.updateSwitchStatus(args.id, args.status);
      }
    }
  }
});

module.exports = new G.GraphQLSchema({
  query: Query,
  mutation: Mutuation
});
