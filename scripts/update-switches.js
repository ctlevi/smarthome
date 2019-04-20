const AWS = require("aws-sdk");

const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10", region: "us-east-1" });

const switches = require("../config/switches.json");

switches.forEach(theswitch => {
  const params = {
    TableName: "switches",
    Item: {
      id: { S: theswitch.id },
      alexaSpeakWord: { S: theswitch.alexaSpeakWord },
      codes: {
        M: {
          on: { N: theswitch.codes.on.toString() },
          off: { N: theswitch.codes.off.toString() }
        }
      },
      number: { N: theswitch.number.toString() },
      purpose: { S: theswitch.purpose },
      status: { S: theswitch.status }
    }
  };
  ddb.putItem(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
});
