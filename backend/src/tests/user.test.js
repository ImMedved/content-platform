/*
User tests
- protected route
*/

const request = require("supertest");
const app = require("../app");

let token;

beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
        username: "user1",
        email: "user1@test.com",
        password: "123456"
    });

    const res = await request(app).post("/api/auth/login").send({
        email: "user1@test.com",
        password: "123456"
    });

    token = res.body.token;
});

describe("User API", () => {

    it("should return current user", async () => {
        const res = await request(app)
            .get("/api/user/me")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.userId).toBeDefined();
    });

});