'use strict';

const G = require('graphql');
const switchDao = require('./switch-dao');

const OnRange = new G.GraphQLObjectType({
  name: "onRange",
  fields: () => ({
    end: {type: G.GraphQLString},
    start: {type: G.GraphQLString}
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
    onRange: {type: OnRange}
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
