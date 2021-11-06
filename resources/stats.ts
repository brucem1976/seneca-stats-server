import { validate as uuidValidate, v4 as uuidv4 } from "uuid";
import {
  addSessionStats,
  deleteSessionStats,
  getCourseStats,
  getSessionStats,
} from "./services/dbService";

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
    const courseId = pathComponents[2],
      sessionId = pathComponents[4];

    if (method === "GET") {
      if (sessionId) {
        return await getSessionStats(userId, courseId, sessionId);
      } else {
        return await getCourseStats(userId, courseId);
      }
    } else if (method === "POST") {
      return await addSessionStats(
        userId,
        courseId,
        JSON.parse(event.body)["stats diff"]
      );
    } else if (method === "DELETE") {
      return await deleteSessionStats(userId, sessionId);
    }

    // We only accept GET/POST for now
    return {
      statusCode: 400,
      headers: {},
      body: "We only accept GET/POST/DELETE",
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: {},
      body: JSON.stringify(error),
    };
  }
};


// errors to use
// 400 Bad Request - course and session id's not uuid v4, post paramters not supplied
// 401 unauthorized - invalid user id uuid v4
// 403 forbidden - course/session doesn't belong to user
// 404 not found - perhaps wrong URL paths?
// 405 method not allowed - PATCH etc
// 500 internal server error - don't think we need
// 501 not implemented - perhaps wrong URL path? don't think we need
// what is that random default, and how do we change to 404 or 501?

// tests
// root route
// another non existing route
// PATCH anything
// invalid/no user id
// no POST parameters, incorrect POST parameters
// non uuidv4 course or session
// session or course for diff user
// not existent route
// create 2 sessions for user, different module numbers
// create 1 session for another user
// check 