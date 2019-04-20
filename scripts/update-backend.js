require("jbash");
const uuid = require("uuid");

const domain = $1;
const password = $2;
const skillId = $3;
if (!domain || !password || !skillId) {
  echo(
    "You need to specify the domain, password, and skillId. e.g. node scripts/update-backend.js tatesmarthome.com thepassword amzn1.ask.skill.27343"
  );
  exit(1);
}

// Get the code build and uploaded
const bucketName = `codebucket${uuid.v4()}`;
eval(`aws s3api create-bucket --bucket ${bucketName}`);
// TODO run the build step for lambda
cd("lambda");
echo("Building lambda code");
// Avoid all the garbage output from zipping
$("npm run build");
echo("Build complete");
cd("..");

eval(`aws s3 cp lambda/dist/lambda.zip s3://${bucketName}/lambda.zip`);

eval(
  `aws cloudformation update-stack \
    --stack-name smarthome \
    --template-body file://cloudformation-template.json \
    --parameters ParameterKey=WebsiteDomain,ParameterValue=${domain} ParameterKey=GlobalPassword,ParameterValue=${password} ParameterKey=AlexaSkillId,ParameterValue=${skillId} ParameterKey=CodeBucket,ParameterValue=${bucketName} \
    --capabilities CAPABILITY_IAM`
);

echo(
  "Run the following to delete the bucket with the temporary code once the stack has finished updating"
);
echo(
  `aws s3 rm s3://${bucketName} --recursive && aws s3api delete-bucket --bucket ${bucketName}`
);
