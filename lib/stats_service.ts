import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class StatsService extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        // 👇 create Dynamodb table
        const table = new dynamodb.Table(this, id, {
            tableName: 'SenecaSessionStats',
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'sessionId', type: dynamodb.AttributeType.STRING },
            pointInTimeRecovery: true,
        });

        // 👇 add local secondary index
        table.addLocalSecondaryIndex({
            indexName: 'course',
            sortKey: { name: 'courseId', type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        const handler = new lambda.Function(this, "StatsHandler", {
            runtime: lambda.Runtime.NODEJS_14_X,
            code: lambda.Code.fromAsset("resources"),
            handler: "stats.main",
            environment: {
                TABLE: table.tableName
            }
        });

        table.grantReadWriteData(handler);

        const getStatsIntegration = new apigateway.LambdaIntegration(handler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        });

        const api = new apigateway.RestApi(this, "stats-api", {
            restApiName: "Stats Service",
            description: "This service serves stats about Seneca Users' consumption.",
        });

        const courses = api.root.addResource('courses');
        const course = courses.addResource('{courseId}');
        course.addMethod("GET", getStatsIntegration); // GET /courses/{courseId}
        course.addMethod("POST", getStatsIntegration); // POST /courses/{courseId}
        const sessions = course.addResource('sessions');
        const session = sessions.addResource('{sessionId}');
        session.addMethod("GET", getStatsIntegration); // GET /courses/{courseId}/sessions/{sessionId}
        session.addMethod("DELETE", getStatsIntegration); // DELETE /courses/{courseId}/sessions/{sessionId}
        addCorsOptions(courses);
        addCorsOptions(course);
        addCorsOptions(sessions);
        addCorsOptions(session);
    }
}

function addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Credentials': "'false'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
        },
      }],
      passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": "{\"statusCode\": 200}"
      },
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
          'method.response.header.Access-Control-Allow-Origin': true,
        },
      }]
    })
  }