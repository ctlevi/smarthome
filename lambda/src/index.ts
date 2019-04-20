import { handler as alexa_handler } from "./index_alexa";
import { handler as graphql_handler } from "./index_graphql";

export async function handler(event: any) {
  // TODO should probably figure out a better way to do this. I want to really know if it 100%
  // came from the alexa service
  if (event.directive) {
    return await alexa_handler(event);
  } else {
    return await graphql_handler(event);
  }
}
