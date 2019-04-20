require("jbash");

const iotOutput = JSON.parse($("aws iot describe-endpoint"));
const describeStackOutput = JSON.parse(
  $("aws cloudformation describe-stacks --stack-name smarthome")
);
function findOutput(describeOutput, outputKey) {
  return describeOutput.Stacks[0].Outputs.find(
    output => output.OutputKey === outputKey
  );
}
const config = {
  iotEndpointAddress: iotOutput.endpointAddress,
  websiteBucketUrl: findOutput(describeStackOutput, "WebsiteURL").OutputValue,
  graphQLUrl:
    findOutput(describeStackOutput, "GraphQLURL").OutputValue + "/graphql"
};
echo(JSON.stringify(config, null, 2), "lambda/src/generated-config.json");
echo(JSON.stringify(config, null, 2), "website/src/generated-config.json");
