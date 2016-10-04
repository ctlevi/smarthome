# Project structure
The project is a single page webapp with a single AWS Lambda GraphQL endpoint. This endpoint talks to a RaspberryPi over
AWS IoT's device gateway. This provides secure access to the RaspberryPi, and you can leave it inside your home network
unexposed to the greater network.

The necessary files for the webapp are in the root of the project. The lambda code is in /lambda. The rPi code is in /iot.

# Frontend
The web frontend uses create-react-app. More information about what commands can be run for the frontend can be found
[here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
The root of the project is the

# Backend
The backend for the project is a single Lambda function implementing a [GraphQL](http://graphql.org/) endpoint. The data
is stored in DynamoDB, and it publishes to MQTT topics that the rPi is connected to.

Currently, a 1 minute cron job via CloudWatch events calls the GraphQL mutation `refreshSwitches` to make the real world
match the state of the DynamoDB table.

# Raspberry Pi
TBD



