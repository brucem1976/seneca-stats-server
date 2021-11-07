import { validate as uuidValidate, v4 as uuidv4 } from "uuid";
import { StatsDto } from "./models/statsDto";
import {
  addSessionStats,
  deleteSessionStats,
  getCourseStats,
  getSessionStats,
} from "./services/dbService";

exports.main = async function (event: any, context: any) {
  const userId = event.headers?.["X-User-Id"]?.toLowerCase().trim();
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
    const courseId = pathComponents[2]?.toLowerCase().trim(),
      sessionId = pathComponents[4]?.toLowerCase().trim();

    if (!uuidValidate(courseId) || (sessionId && !uuidValidate(sessionId))) {
      return {
        statusCode: 400,
        headers: {},
        body: JSON.stringify({ error: "courseId and/or sessionId invalid" }),
      };
    }

    if (method === "GET") {
      if (sessionId) {
        return await getSessionStats(userId, courseId, sessionId);
      } else {
        return await getCourseStats(userId, courseId);
      }
    } else if (method === "POST") {
      const stats: StatsDto = JSON.parse(event.body)["stats diff"];
      if(!stats || !uuidValidate(stats.sessionId) || isNaN(stats.averageScore) || isNaN(stats.timeStudied) || isNaN(stats.totalModulesStudied)) {
        return {
          statusCode: 400,
          headers: {},
          body: JSON.stringify({ error: "stats entry invalid" }),
        }
      }
      return await addSessionStats(
        userId,
        courseId,
        stats
      );
    } else if (method === "DELETE") {
      return await deleteSessionStats(userId, sessionId);
    }

    // We only accept GET/POST for now
    return {
      statusCode: 405,
      headers: {}
    };
  } catch (error) {

    return {
      statusCode: 500,
      headers: {},
      body: JSON.stringify(error),
    };
  }
};