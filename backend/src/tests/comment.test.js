/*
Comment tests
*/

const request = require("supertest");
const app = require("../src/app");

let token;
let postId;

beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
        username: "comment_user",
        email: "comment@test.com",
        password: "123456"
    });

    const login = await request(app).post("/api/auth/login").send({
        email: "comment@test.com",
        password: "123456"
    });

    token = login.body.token || login.body.data?.token;

    const post = await request(app)
        .post("/api/posts")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "post",
            content: [{ type: "text", value: "test" }]
        });

    postId = post.body.data.postId;
});

describe("Comment API", () => {
    it("should create comment", async () => {
        const res = await request(app)
            .post("/api/comments")
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                content: "hello"
            });

        expect(res.statusCode).toBe(200);
    });

    it("should get comments", async () => {
        const res = await request(app)
            .get(`/api/comments/post/${postId}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});