/*
Post tests
*/

const request = require("supertest");
const app = require("../app");
const { apiPath, responseData, responseToken } = require("./helpers/api");

let token;
let postId;

beforeEach(async () => {
    await request(app).post(apiPath("/auth/register")).send({
        username: "postuser",
        email: "post@test.com",
        password: "123456"
    });

    const res = await request(app).post(apiPath("/auth/login")).send({
        email: "post@test.com",
        password: "123456"
    });

    token = responseToken(res);

    const postRes = await request(app)
        .post(apiPath("/posts"))
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "seed post",
            description: "seed desc",
            content: [
                { type: "text", value: "seed body" }
            ],
            access: { type: "free" }
        });

    postId = responseData(postRes).postId;
});

describe("Post API", () => {

    it("should create post", async () => {
        const res = await request(app)
            .post(apiPath("/posts"))
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
            .get(apiPath("/posts"));

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("should return post by id", async () => {
        const res = await request(app)
            .get(apiPath(`/posts/${postId}`));

        expect(res.statusCode).toBe(200);
        expect(responseData(res).post.id).toBe(postId);
        expect(responseData(res).post.title).toBe("seed post");
        expect(responseData(res).post.author_username).toBe("postuser");
    });

});
