/*
User tests
- protected route
*/

const request = require("supertest");
const app = require("../app");
const { apiPath, responseData, responseToken } = require("./helpers/api");

let token;

beforeEach(async () => {
    await request(app).post(apiPath("/auth/register")).send({
        username: "user1",
        email: "user1@test.com",
        password: "123456"
    });

    const res = await request(app).post(apiPath("/auth/login")).send({
        email: "user1@test.com",
        password: "123456"
    });

    token = responseToken(res);
});

describe("User API", () => {

    it("should return current user", async () => {
        const res = await request(app)
            .get(apiPath("/users/me"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(responseData(res).id).toBeDefined();
    });

});
