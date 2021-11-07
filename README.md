# Welcome to Seneca Stats Service!

## Instructions

This repo will allow you to spin up an AWS ecosystem consisting of an API gateway with specific endpoints, a Lambda to handle the
API calls, and a DynamoDB with a single table to persist the required stats.

After installing, building and deploying, the tests will confirm full functionality of the system as per the Swagger doc present

You will need AWS CLI and CDK installed on your machine, with 'cdk bootstrap aws://ACCOUNT-NUMBER/REGION' having been run
```
npm install
npm run build
cdk deploy
```
set the resultant API URL to environment variable STATS_URL (WITHOUT the trailing /)
```
npm run test
```

# Assumptions I made

The database and code have been optimised for this simple requirement. Hypothetical tests are always difficult, and so please feel free to ask me if you'd like me to introduce more sophistication in terms of things like:
* multiple tables
* a relational DB solution with an ORM
* considerations around throughput and table sizes and performance
* different environments for staging and prod

Although the swagger was specific for http and localhost, I implemented online in AWS with API gateway
There is no authentication, I am happy to implement if you would like
I added a delete endpoint to the Swagger and API to keep the DB maintained 