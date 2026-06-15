/*
User tests
- protected route
*/

const request = require("supertest");
const app = require("../app");
const { apiPath, responseData, responseToken } = require("./helpers/api");

let token;
let userId;

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

    const meRes = await request(app)
        .get(apiPath("/users/me"))
        .set("Authorization", `Bearer ${token}`);

    userId = responseData(meRes).id;
});

describe("User API", () => {

    it("should return current user", async () => {
        const res = await request(app)
            .get(apiPath("/users/me"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(responseData(res).id).toBeDefined();
    });

    it("should return user profile by id", async () => {
        const res = await request(app).get(apiPath(`/users/${userId}`));

        expect(res.statusCode).toBe(200);
        expect(responseData(res).id).toBe(userId);
    });

    it("should return following list for current user", async () => {
        const res = await request(app)
            .get(apiPath("/users/me/following"))
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(responseData(res))).toBe(true);
    });

});
