import { validate as uuidValidate, v4 as uuidv4 } from "uuid";
import { addSessionStats, getCourseStats, getSessionStats } from "./services/dbService";

exports.main = async function (event: any, context: any) {
  const userId = event.headers?.["X-User-Id"];
  if (!uuidValidate(userId)) {
    return {
      statusCode: 401,
      headers: {},
      body: JSON.stringify({ error: "Invalid user ID" }),
    };
  }

  try {
    var method = event.httpMethod;
    const pathComponents = event.path.split("/");

    if (method === "GET") {
      let retBody = "Some dummy aggregated course stats";
      if (pathComponents[4]) {
        return await getSessionStats(userId, pathComponents[2], pathComponents[4])
        // console.log(
        //   `Let's GET course ${pathComponents[2]}, session ${pathComponents[4]} for user ${userId}`
        // );
        // retBody = "Somy dummy session stats";
      } else {
        return await getCourseStats(userId, pathComponents[2]);
        // console.log(`Let's GET course ${pathComponents[2]} for user ${userId}`);
      }

      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ data: retBody }),
      };
    } else if (method === "POST") {
      return await addSessionStats(
        userId,
        pathComponents[2],
        JSON.parse(event.body)["stats diff"]
      );
    }

    // We only accept GET/POST for now
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET/POST",
    };
  } catch (error) {
    // var body: {} = error.stack || JSON.stringify(error, null, 2);
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify(error),
    };
  }
};