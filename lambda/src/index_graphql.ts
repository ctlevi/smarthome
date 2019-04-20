import * as G from "graphql";
import Schema from "./schema";

export async function handler(event: any) {
  try {
    if (
      !event.headers ||
      event.headers["global-password"] !== process.env.GLOBAL_PASSWORD
    ) {
      return makeResponseObject(403);
    }

    // If it comes from the cloudwatch rules static input. I could not make the rules send
    // a query that looked similar to api gateway object because of the graphql nested objects
    let query = event.query;

    // patch to allow queries from GraphiQL
    // like the initial introspectionQuery
    // TODO, I highly doubt this works anymore now that we are doing api gateway proxy
    if (event.query && event.query.hasOwnProperty("query")) {
      query = event.query.query.replace("\n", " ", "g");
    }

    // Came from api gateway
    if (event.body) {
      query = JSON.parse(event.body).query;
    }

    return G.graphql(Schema, query).then(result => {
      if (result.errors) {
        return makeResponseObject(500, JSON.stringify(result.errors));
      } else {
        return makeResponseObject(200, JSON.stringify(result.data));
      }
    });
  } catch (err) {
    console.log(err.stack);
    throw err;
  }
}

function makeResponseObject(statusCode: number, body?: string) {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      "Access-Control-Allow-Origin": "*" // TODO env-var that sets http://www.tatesmarthome.com
    }
  };
}
