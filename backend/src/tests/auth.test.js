/*
Auth tests
- register endpoint
- login endpoint
*/

const request = require("supertest");
const app = require("../app");

describe("Auth API", () => {

    const email = `test_${Date.now()}@test.com`;

    it("should register user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                username: "test",
                email,
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.userId).toBeDefined();
    });

    it("should login user", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email,
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

});