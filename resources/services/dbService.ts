import * as AWS from "aws-sdk";
import { StatsDto } from "../models/statsDto";

const TABLE_NAME = "SenecaSessionStats";

export const addSessionStats = async (
  userId: string,
  courseId: string,
  stats: StatsDto
) => {
  //   const TABLE_NAME = process.env.TABLE || "";
  // const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

  const db = new AWS.DynamoDB.DocumentClient();

  const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
    DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

  const { sessionId, totalModulesStudied, averageScore, timeStudied } = stats;

  const item: Session = {
    userId,
    courseId,
    sessionId,
    totalModulesStudied,
    averageScore,
    timeStudied,
  };

  const params = {
    // TableName: TABLE_NAME,
    TableName: TABLE_NAME,
    Item: item,
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: "" };
  } catch (dbError) {
    const dbE: any = dbError;
    const errorResponse =
      dbE.code === "ValidationException" &&
      dbE.message.includes("reserved keyword")
        ? DYNAMODB_EXECUTION_ERROR
        : RESERVED_RESPONSE;
    return { statusCode: 500, body: JSON.stringify(dbE) };
  }
};

export const getSessionStats = async (
  userId: string,
  courseId: string,
  sessionId: string
) => {
  const db = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId,
      sessionId,
    },
  };

  try {
    const response = await db.get(params).promise();
    if (response.Item) {
      // TODO check course
      delete response.Item.userId, delete response.Item.courseId;
      return { statusCode: 200, body: JSON.stringify(response.Item) };
    } else {
      return { statusCode: 404 };
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export const getCourseStats = async (userId: string, courseId: string) => {
  const db = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'course',
    KeyConditionExpression: "userId = :ui and courseId = :ci",
    ExpressionAttributeValues: {
      ":ui": userId,
      ":ci": courseId,
    },
  };

  try {
    const response = await db.query(params).promise();
    //   const response = await db.scan(params).promise();

    const totalTimeStudied = response.Items?.reduce(
      (acc, arg) => acc + arg.timeStudied,
      0
    ) || 0;
    const totalModulesStudied =
      response.Items?.reduce((acc, arg) => acc + arg.totalModulesStudied, 0) ||
      0;
    // we need to weight the average here
    const totalScore =
      response.Items?.reduce(
        (acc, arg) => acc + arg.totalModulesStudied * arg.averageScore,
        0
      ) || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({
        timeStudied: totalTimeStudied,
        totalModulesStudied,
        averageScore: totalModulesStudied ? totalScore / totalModulesStudied : 0,
      }),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};

export const deleteSessionStats = async (
  userId: string,
  sessionId: string
) => {
  const db = new AWS.DynamoDB.DocumentClient();

  const params = {
    TableName: TABLE_NAME,
    Key: {
      userId,
      sessionId,
    },
  };

  try {
    const response = await db.delete(params).promise();
    console.log('DEL res: ', JSON.stringify(response))
    console.log('DEL res2: ', response)
    return { statusCode: 200, body: undefined };
  } catch (dbError) {
      console.log(dbError);
      console.log(JSON.stringify(dbError));
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
