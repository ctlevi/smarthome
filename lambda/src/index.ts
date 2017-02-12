import * as G from 'graphql';
import Schema from './schema';

export function handler(event: any, context: any, callback: any) {
  let query = event.query;

  // patch to allow queries from GraphiQL
  // like the initial introspectionQuery
  if (event.query && event.query.hasOwnProperty('query')) {
    query = event.query.query.replace("\n", ' ', "g");
  }

  G.graphql(Schema, query)
    .then(result => {
      if (result.errors) {
        callback(result.errors)
      } else {
        callback(null, result.data)
      }
    })
    .catch(err => callback(err));
}
