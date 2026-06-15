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
        await request(app)
            .post(apiPath("/comments"))
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                content: "hello"
            });

        const res = await request(app)
            .get(apiPath(`/comments/post/${postId}`));

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data[0].author_username).toBe("comment_user");
    });

    it("should delete own comment", async () => {
        const createRes = await request(app)
            .post(apiPath("/comments"))
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                content: "delete me"
            });

        const commentId = createRes.body.data.commentId;

        const deleteRes = await request(app)
            .delete(apiPath(`/comments/${commentId}`))
            .set("Authorization", `Bearer ${token}`);

        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body.data).toBe(true);
    });
});
