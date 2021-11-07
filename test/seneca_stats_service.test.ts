import { expect, assert } from "chai";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

const API_URL = process.env.STATS_API;

describe("api url in env", () => {
  it("should be present", async () => {
    expect(API_URL).not.to.be.undefined;
  });
  it("not to end with /", async () => {
    const lastChar = API_URL?.slice(-1);
    expect(lastChar).to.not.equal("/");
  });
});

describe("invalid api calls", () => {
  it("should reject / with 403", async () => {
    const res = await fetch(`${API_URL}`);
    expect(res.status).to.equal(403);
  });
  it("should reject /somerandomroute with 403", async () => {
    const res = await fetch(`${API_URL}/somerandomroute`);
    expect(res.status).to.equal(403);
  });
  const courseId = uuidv4();
  it("should reject PATCH with 403", async () => {
    const res = await fetch(`${API_URL}/courses/${courseId}`, {
      method: "PATCH",
    });
    expect(res.status).to.equal(403);
  });

  it("should reject invalid userId with 401", async () => {
    const res = await fetch(`${API_URL}/courses/${courseId}`, {
      headers: { "X-User-Id": "123" },
    });
    expect(res.status).to.equal(401);
  });

  const userId = uuidv4();
  it("should reject non-uuid courseId with 400", async () => {
    const res = await fetch(`${API_URL}/courses/123`, {
      method: "POST",
      headers: { "X-User-Id": userId },
      body: JSON.stringify({
        "stats diff": {
          sessionId,
          totalModulesStudied: 2,
          averageScore: 3.4,
          timeStudied: 20000,
        },
      }),
    });
    expect(res.status).to.equal(400);
  });
  const sessionId = uuidv4();
  it("should reject invalid stats parameters with 400", async () => {
    const res = await fetch(`${API_URL}/courses/${courseId}`, {
      method: "POST",
      headers: { "X-User-Id": userId },
      body: JSON.stringify({
        "stats diff": {
          sessionId,
          totalModulesStudied: 2,
          averageScore: 3.4,
          timeStudied: "a",
        },
      }),
    });
    expect(res.status).to.equal(400);
  });
});

const user1 = uuidv4(),
  user2 = uuidv4();
const course1 = uuidv4(),
  course2 = uuidv4();
const session1 = uuidv4(),
  session2 = uuidv4(),
  session3 = uuidv4(),
  session4 = uuidv4();

describe("valid api calls", () => {
  it(`should create user1 course1 session1`, async () => {
    const res = await fetch(`${API_URL}/courses/${course1}`, {
      method: "POST",
      headers: { "X-User-Id": user1 },
      body: JSON.stringify({
        "stats diff": {
          sessionId: session1,
          totalModulesStudied: 2,
          averageScore: 30,
          timeStudied: 1200000,
        },
      }),
    });
    expect(res.status).to.equal(201);
  });
  it(`should create user1 course2 session2`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}`, {
      method: "POST",
      headers: { "X-User-Id": user1 },
      body: JSON.stringify({
        "stats diff": {
          sessionId: session2,
          totalModulesStudied: 4,
          averageScore: 40,
          timeStudied: 2400000,
        },
      }),
    });
    expect(res.status).to.equal(201);
  });
  it(`should create user1 course2 session3`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}`, {
      method: "POST",
      headers: { "X-User-Id": user1 },
      body: JSON.stringify({
        "stats diff": {
          sessionId: session3,
          totalModulesStudied: 8,
          averageScore: 85,
          timeStudied: 4120000,
        },
      }),
    });
    expect(res.status).to.equal(201);
  });
  it(`should create user2 course2 session4`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}`, {
      method: "POST",
      headers: { "X-User-Id": user2 },
      body: JSON.stringify({
        "stats diff": {
          sessionId: session4,
          totalModulesStudied: 10,
          averageScore: 100,
          timeStudied: 6543210,
        },
      }),
    });
    expect(res.status).to.equal(201);
  });
});

describe("correct stat results", () => {
  it(`user2 course2 session4 should have all stats right`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}/sessions/${session4}`, {
      headers: { "X-User-Id": user2 },
    });
    expect(res.status).to.equal(200);
    const resJson = await res.json();
    expect(resJson.sessionId).to.equal(session4);
    expect(resJson.totalModulesStudied).to.equal(10);
    expect(resJson.averageScore).to.equal(100);
    expect(resJson.timeStudied).to.equal(6543210);
  })
  it(`user1 course2 should have aggregated stats right, uninfluenced by course1 or user2`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}`, {
      headers: { "X-User-Id": user1 },
    });
    expect(res.status).to.equal(200);
    const resJson = await res.json();
    expect(resJson.totalModulesStudied).to.equal(12);
    expect(resJson.averageScore).to.equal(70);
    expect(resJson.timeStudied).to.equal(6520000);
  })
  
})
  

describe("clean up calls", () => {
  it(`should delete user1 course1 session1`, async () => {
    const res = await fetch(`${API_URL}/courses/${course1}/sessions/${session1}`, {
      method: "DELETE",
      headers: { "X-User-Id": user1 },
    });
    expect(res.status).to.equal(200);
  });
  it(`should delete user1 course2 session2`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}/sessions/${session2}`, {
      method: "DELETE",
      headers: { "X-User-Id": user1 },
    });
    expect(res.status).to.equal(200);
  });
  it(`should delete user1 course2 session3`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}/sessions/${session3}`, {
      method: "DELETE",
      headers: { "X-User-Id": user1 },
    });
    expect(res.status).to.equal(200);
  });
  it(`should delete user2 course2 session4`, async () => {
    const res = await fetch(`${API_URL}/courses/${course2}/sessions/${session4}`, {
      method: "DELETE",
      headers: { "X-User-Id": user2 },
    });
    expect(res.status).to.equal(200);
  });
});
