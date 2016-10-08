const awsIot = require('aws-iot-device-sdk');
const execSync = require('child_process').execSync;

// Point to your own AWS IoT certs
const device = awsIot.device({
  keyPath: '/home/pi/config/c235244e5b-private.pem.key',
  certPath: '/home/pi/config/c235244e5b-certificate.pem.crt',
  caPath: '/home/pi/config/root-CA.crt',
  clientId: 'RaspberryPi',
  region: 'us-west-2'
});

device
  .on('connect', function() {
    console.log('connected to topic: lights');
    device.subscribe('lights');
  });

device
  .on('message', function(topic, payload) {
    console.log(`message from ${topic} with payload: ${payload.toString()}`);
    const { code } = JSON.parse(payload);
    execSync(`./433Utils/RPi_utils/codesend ${code} 0 189`, {stdio: 'inherit'});
  });