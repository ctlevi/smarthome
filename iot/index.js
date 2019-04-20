const awsIot = require("aws-iot-device-sdk");
const execSync = require("child_process").execSync;

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
}, 60000);
