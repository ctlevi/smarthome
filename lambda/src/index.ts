import * as G from 'graphql';
import Schema from './schema';

export function handler(event: any, context: any, callback: any) {
  try {
    if (!event.headers || event.headers['global-password'] !== process.env.globalPassword) {
      return callback(null, makeResponseObject(403));
    }

    // If it comes from the cloudwatch rules static input. I could not make the rules send
    // a query that looked similar to api gateway object because of the graphql nested objects
    let query = event.query;

    // patch to allow queries from GraphiQL
    // like the initial introspectionQuery
    // TODO, I highly doubt this works anymore now that we are doing api gateway proxy
    if (event.query && event.query.hasOwnProperty('query')) {
      query = event.query.query.replace("\n", ' ', "g");
    }

    // Came from api gateway
    if (event.body) {
      query = JSON.parse(event.body).query;
    }

    G.graphql(Schema, query)
      .then(result => {
        if (result.errors) {
          callback(null, makeResponseObject(500, JSON.stringify(result.errors)));
        } else {
          callback(null, makeResponseObject(200, JSON.stringify(result.data)));
        }
      })
      .catch(err => callback(err));
  } catch (err) {
    console.log(err.stack);
    callback(err.message);
  }
}

function makeResponseObject(statusCode: number, body?: string) {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Access-Control-Allow-Origin': '*', // TODO env-var that sets http://www.tatesmarthome.com
    }
  }
}