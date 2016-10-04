'use strict';

const G = require('graphql');
const Schema = require('./schema');

exports.handler = function(event, context, callback) {
  let query = event.query;

  // patch to allow queries from GraphiQL
  // like the initial introspectionQuery
  if (event.query && event.query.hasOwnProperty('query')) {
    query = event.query.query.replace("\n", ' ', "g");
  }

  G.graphql(Schema, query)
    .then(result => callback(null, result))
    .catch(err => callback(err));
};
