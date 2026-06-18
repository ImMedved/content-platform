/*
Auth tests
- register endpoint
- login endpoint
*/

const request = require("supertest");
const app = require("../app");
const { apiPath, responseData } = require("./helpers/api");

describe("Auth API", () => {

    const email = `test_${Date.now()}@test.com`;

    it("should register user", async () => {
        const res = await request(app)
            .post(apiPath("/auth/register"))
            .send({
                username: "test",
                email,
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
        expect(responseData(res).userId).toBeDefined();
    });

    it("should login user", async () => {
        const loginEmail = `login_${Date.now()}@test.com`;

        await request(app)
            .post(apiPath("/auth/register"))
            .send({
                username: "login_test",
                email: loginEmail,
                password: "123456"
            });

        const res = await request(app)
            .post(apiPath("/auth/login"))
            .send({
                email: loginEmail,
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
        expect(responseData(res).token).toBeDefined();
    });

    it("should create starter wallet on registration", async () => {
        const walletEmail = `wallet_${Date.now()}@test.com`;

        await request(app)
            .post(apiPath("/auth/register"))
            .send({
                username: "wallet_test",
                email: walletEmail,
                password: "123456"
            });

        const loginRes = await request(app)
            .post(apiPath("/auth/login"))
            .send({
                email: walletEmail,
                password: "123456"
            });

        const meRes = await request(app)
            .get(apiPath("/users/me"))
            .set("Authorization", `Bearer ${responseData(loginRes).token}`);

        expect(meRes.statusCode).toBe(200);
        expect(responseData(meRes).wallet_balance).toBe(100);
    });

});
