/*
Post tests
*/

const request = require("supertest");
const app = require("../app");

let token;

beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
        username: "postuser",
        email: "post@test.com",
        password: "123456"
    });

    const res = await request(app).post("/api/auth/login").send({
        email: "post@test.com",
        password: "123456"
    });

    token = res.body.token;
});

describe("Post API", () => {

    it("should create post", async () => {
        const res = await request(app)
            .post("/api/v1/posts")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "test post",
                description: "desc",
                content: [
                    { type: "text", value: "hello" }
                ],
                access: { type: "free" }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.postId).toBeDefined();
    });

    it("should list posts", async () => {
        const res = await request(app)
            .get("/api/v1/posts");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

});