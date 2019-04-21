const AWS = require("aws-sdk");
const awsIot = require("aws-iot-device-sdk");
const execSync = require("child_process").execSync;
const axios = require("axios");

const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10", region: "us-east-1" });

// Point to your own AWS IoT certs
const device = awsIot.device({
  keyPath: "/home/pi/config/62a70b2b75-private.pem.key",
  certPath: "/home/pi/config/62a70b2b75-certificate.pem.crt",
  caPath: "/home/pi/config/root-CA.crt",
  clientId: "RaspberryPi",
  region: "us-east-1"
});

device.on("connect", function() {
  console.log("connected to topic: lights");
  device.subscribe("lights");
});

device.on("message", function(topic, payload) {
  console.log(`message from ${topic} with payload: ${payload.toString()}`);
  const { code } = JSON.parse(payload);
  execSync(`./433Utils/RPi_utils/codesend ${code} 0 189`, { stdio: "inherit" });
});

setInterval(() => {
  device.publish(
    "$aws/things/RaspberryPi/shadow/update",
    JSON.stringify({
      state: {
        reported: {
          pingTime: new Date().toISOString()
        }
      }
    })
  );
  axios
    .get("http://192.168.1.22/32802f030119&Stats/json")
    .then(response => {
      const rawTemp = response.data.Stats.Temp;
      const rawHumi = response.data.Stats.Humi;
      const temperature = rawTemp.substring(0, rawTemp.length - 1);
      const humidity = rawHumi.substring(0, rawHumi.length - 1);
      const nowString = new Date().toISOString();
      const date = nowString.split("T")[0];
      const timeWithZ = nowString.split("T")[1];
      const time = timeWithZ.substring(0, timeWithZ.length - 1);
      const params = {
        TableName: "events",
        Item: {
          date: { S: date },
          time: { S: time },
          deviceId: { S: "32802f030119" },
          temperature: { N: temperature },
          humidity: { N: humidity }
        }
      };
      ddb.putItem(params, function(err) {
        if (err) {
          console.log("Error", err);
        }
      });
    })
    .catch(err => console.log("Error fetching from sensor 32802f030119", err));
}, 60000);
