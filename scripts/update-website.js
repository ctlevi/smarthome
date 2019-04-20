require("jbash");

cd("website");
eval("npm run build");
eval("aws s3 cp build s3://www.tatesmarthome.com --recursive");
