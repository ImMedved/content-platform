/*
Feed tests
*/

const request = require("supertest");
const app = require("../app");

let token1;
let token2;

beforeAll(async () => {
    // user1
    await request(app).post("/api/auth/register").send({
        username: "u1",
        email: "u1@test.com",
        password: "123456"
    });

    const res1 = await request(app).post("/api/auth/login").send({
        email: "u1@test.com",
        password: "123456"
    });

    token1 = res1.body.token;

    // user2
    await request(app).post("/api/auth/register").send({
        username: "u2",
        email: "u2@test.com",
        password: "123456"
    });

    const res2 = await request(app).post("/api/auth/login").send({
        email: "u2@test.com",
        password: "123456"
    });

    token2 = res2.body.token;

    // user2 creates post
    await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token2}`)
        .send({
            title: "post from u2",
            content: [{ type: "text", value: "hello" }]
        });

    // user1 follows user2
    await request(app)
        .post("/api/follow/2")
        .set("Authorization", `Bearer ${token1}`);
});

describe("Feed API", () => {

    it("should return feed posts", async () => {
        const res = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

});