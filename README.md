# Setup
`git clone --recursive https://github.com/ctlevi/smarthome.git`
Make sure to add `--recursive` so that you get all of the necessary submodules for the raspberry pi.

## RaspberryPi
Setup for the wireless outlets was done through [this amazing tutorial](https://www.samkear.com/hardware/control-power-outlets-wirelessly-raspberry-pi).

The code can then be copied to your RPi, and the following commands run:
```bash
npm install
npm run build // Compiles the C++ code to send the RF signals
npm run start // Starts the script in a forever process
```

## AWS Resources
To create:
Make sure to replace the parameters with what you care about. Descriptions can be found at the top of cloudformation-template.json
`aws cloudformation create-stack --stack-name smarthome --template-body file://cloudformation-template.json -parameters ParameterKey=WebsiteDomain,ParameterValue=tatesmarthome.com`

To update:
`aws cloudformation update-stack --stack-name smarthome --template-body file://cloudformation-template.json --parameters ParameterKey=WebsiteDomain,ParameterValue=tatesmarthome.com`

The AWS Resources give you:
* A public S3 bucket that you can find the url of the bucket in the output of the Cloudformation stack creation, called WebsiteURL. You can manually update the CNAME record with your domain provider so that your domain you gave during creation will point to this bucket with the website.
* A DynamoDB table called "switches" with some configuration data for the radio switches you want to control. You can use config/switches.json to set up the radio signal codes and names of the switches. Running `node scripts/update-switches.js` will update the table based on the config.

# Project structure
The project is a single page webapp with a single AWS Lambda GraphQL endpoint. This endpoint talks to a RaspberryPi over
AWS IoT's device gateway. This provides secure access to the RaspberryPi, and you can leave it inside your home network
unexposed to the greater network.

The necessary files for the webapp are in the root of the project. The lambda code is in /lambda. The rPi code is in /iot.

# Frontend
The web frontend uses create-react-app. More information about what commands can be run for the frontend can be found
[here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
The webapp is deployed to a public S3 bucket exposed as a static website. It then gets it's data from the Lambda function
GraphQL endpoint.

To upload new code to S3, run `npm run upload` in the root of the project.

# Backend
The backend for the project is a single Lambda function implementing a [GraphQL](http://graphql.org/) endpoint. The data
is stored in DynamoDB, and it publishes to MQTT topics that the rPi is connected to.

Currently, a 1 minute cron job via CloudWatch events calls the GraphQL mutation `refreshSwitches` to make the real world
match the state of the DynamoDB table.

To deploy new code for the Lambda function, run `npm run upload` in the /lambda folder.

# Raspberry Pi
TBD



