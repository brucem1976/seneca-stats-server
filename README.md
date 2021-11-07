# Welcome to Seneca Stats Service!

## Instructions

You will need AWS CLI and CDK installed on your machine, with 'cdk bootstrap aws://ACCOUNT-NUMBER/REGION' having been run
```
npm install
npm run build
cdk deploy
```
set the resultant API URL to environment variable STATS_URL (WITHOUT the trailing /)
npm run test

# Assumptions I made

The database and code have been optimised for this simple requirement. Hypothetical tests are always difficult, and so please feel free to ask me if you'd like me to introduce more sophistication in terms of things like:
* multiple tables
* a relational DB solution with an ORM
* considerations around throughput and table sizes and performance
* different environments for staging and prod
* although the swagger was specific for http and localhost, I implemented online in AWS with API gateway
* there is no authentication, I am happy to implement if you would like
* I added a delete endpoint to the Swagger and API to keep the DB maintained 