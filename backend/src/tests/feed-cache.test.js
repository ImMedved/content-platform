/*
Feed cache tests
- redis cache works with feed
*/

const request = require("supertest");
const app = require("../app");
const redisClient = require("../config/redis");

let token1;
let token2;

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    await redisClient.flushAll();

    await request(app).post("/api/auth/register").send({
        username: "cache_u1",
        email: "cache_u1@test.com",
        password: "123456"
    });

    const login1 = await request(app).post("/api/auth/login").send({
        email: "cache_u1@test.com",
        password: "123456"
    });

    token1 = login1.body.token || login1.body.data?.token;

    await request(app).post("/api/auth/register").send({
        username: "cache_u2",
        email: "cache_u2@test.com",
        password: "123456"
    });

    const login2 = await request(app).post("/api/auth/login").send({
        email: "cache_u2@test.com",
        password: "123456"
    });

    token2 = login2.body.token || login2.body.data?.token;

    await request(app)
        .post("/api/follow/2")
        .set("Authorization", `Bearer ${token1}`);
});

afterAll(async () => {
    await redisClient.flushAll();
});

describe("Feed cache integration", () => {
    it("should return feed and use redis without errors", async () => {
        const first = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token1}`);

        expect(first.statusCode).toBe(200);

        const second = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token1}`);

        expect(second.statusCode).toBe(200);
        expect(Array.isArray(second.body.data)).toBe(true);
    });

    it("should invalidate feed cache after new post", async () => {
        await request(app)
            .post("/api/posts")
            .set("Authorization", `Bearer ${token2}`)
            .send({
                title: "cached post",
                description: "desc",
                content: [{ type: "text", value: "hello cache" }],
                access: { type: "free" }
            });

        const res = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
});