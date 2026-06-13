/*
Comment tests
*/

const request = require("supertest");
const app = require("../app");
const { apiPath, responseToken } = require("./helpers/api");

let token;
let postId;

beforeEach(async () => {
    await request(app).post(apiPath("/auth/register")).send({
        username: "comment_user",
        email: "comment@test.com",
        password: "123456"
    });

    const login = await request(app).post(apiPath("/auth/login")).send({
        email: "comment@test.com",
        password: "123456"
    });

    token = responseToken(login);

    const post = await request(app)
        .post(apiPath("/posts"))
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
            .post(apiPath("/comments"))
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                content: "hello"
            });

        expect(res.statusCode).toBe(200);
    });

    it("should get comments", async () => {
        const res = await request(app)
            .get(apiPath(`/comments/post/${postId}`));

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
