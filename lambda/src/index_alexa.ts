import * as switchDao from "./switch-dao";

export async function handler(request: any) {
  if (
    request.directive.header.namespace === "Alexa.Discovery" &&
    request.directive.header.name === "Discover"
  ) {
    log("DEBUG:", "Discover request", JSON.stringify(request));
    return await handleDiscovery(request);
  } else if (
    request.directive.header.namespace === "Alexa.PowerController" &&
    (request.directive.header.name === "TurnOn" ||
      request.directive.header.name === "TurnOff")
  ) {
    log("DEBUG:", "TurnOn or TurnOff Request", JSON.stringify(request));
    return await handlePowerControl(request);
  } else {
    return null;
  }
}

async function handleDiscovery(request: any) {
  const endpointTemplate = {
    // Fill in commented out fields
    // "endpointId": "demo_id",
    manufacturerName: "Smart Device Company",
    // "friendlyName": "Bedroom Outlet",
    description: "Smart Device Switch",
    displayCategories: ["SWITCH"],
    cookie: {
      key1: "arbitrary key/value pairs for skill to reference this endpoint.",
      key2: "There can be multiple entries",
      key3: "but they should only be used for reference purposes.",
      key4: "This is not a suitable place to maintain current endpoint state."
    },
    capabilities: [
      {
        type: "AlexaInterface",
        interface: "Alexa",
        version: "3"
      },
      {
        interface: "Alexa.PowerController",
        version: "3",
        type: "AlexaInterface",
        properties: {
          supported: [
            {
              name: "powerState"
            }
          ],
          retrievable: true
        }
      }
    ]
  };
  const switches = await switchDao.getSwitches();
  const endpoints = switches.map(s => ({
    ...endpointTemplate,
    endpointId: s.id,
    friendlyName: s.alexaSpeakWord
  }));
  var payload = {
    endpoints: endpoints
  };
  var header = request.directive.header;
  header.name = "Discover.Response";
  log(
    "DEBUG",
    "Discovery Response: ",
    JSON.stringify({ header: header, payload: payload })
  );
  return { event: { header: header, payload: payload } };
}

function log(message: string, message1: string, message2: string) {
  console.log(message + message1 + message2);
}

async function handlePowerControl(request: any) {
  log("DEBUG", "Alexa.PowerController ", JSON.stringify(request));
  // get device ID passed in during discovery
  var requestMethod = request.directive.header.name;
  var responseHeader = request.directive.header;
  responseHeader.namespace = "Alexa";
  responseHeader.name = "Response";
  responseHeader.messageId = responseHeader.messageId + "-R";
  // get user token pass in request
  var requestToken = request.directive.endpoint.scope.token;
  var powerResult;

  const switchId = request.directive.endpoint.endpointId;
  if (requestMethod === "TurnOn") {
    // Make the call to your device cloud for control
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    await switchDao.updateSwitchStatus(switchId, "on");
    powerResult = "ON";
  } else if (requestMethod === "TurnOff") {
    // Make the call to your device cloud for control and check for success
    // powerResult = stubControlFunctionToYourCloud(endpointId, token, request);
    powerResult = "OFF";
    await switchDao.updateSwitchStatus(switchId, "off");
  }
  var contextResult = {
    properties: [
      {
        namespace: "Alexa.PowerController",
        name: "powerState",
        value: powerResult,
        timeOfSample: "2017-09-03T16:20:50.52Z", //retrieve from result.
        uncertaintyInMilliseconds: 50
      }
    ]
  };
  var response = {
    context: contextResult,
    event: {
      header: responseHeader,
      endpoint: {
        scope: {
          type: "BearerToken",
          token: requestToken
        },
        endpointId: "demo_id"
      },
      payload: {}
    }
  };
  log("DEBUG", "Alexa.PowerController ", JSON.stringify(response));
  return response;
}
