/*
Integration feed flow
- follow
- create post
- read feed
*/

const request = require("supertest");
const app = require("../../app");

describe("Feed flow", () => {
    it("should show followed author posts in feed", async () => {
        await request(app).post("/api/auth/register").send({
            username: "follower_user",
            email: "follower_user@test.com",
            password: "123456"
        });

        await request(app).post("/api/auth/register").send({
            username: "author_user",
            email: "author_user@test.com",
            password: "123456"
        });

        const followerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "follower_user@test.com",
                password: "123456"
            });

        const authorLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: "author_user@test.com",
                password: "123456"
            });

        const followerToken = followerLogin.body.token || followerLogin.body.data?.token;
        const authorToken = authorLogin.body.token || authorLogin.body.data?.token;

        const meAuthor = await request(app)
            .get("/api/users/me")
            .set("Authorization", `Bearer ${authorToken}`);

        const authorId = meAuthor.body.data.id;

        await request(app)
            .post(`/api/follow/${authorId}`)
            .set("Authorization", `Bearer ${followerToken}`);

        await request(app)
            .post("/api/posts")
            .set("Authorization", `Bearer ${authorToken}`)
            .send({
                title: "author post",
                content: [{ type: "text", value: "post for feed" }],
                access: { type: "free" }
            });

        const feedRes = await request(app)
            .get("/api/feed")
            .set("Authorization", `Bearer ${followerToken}`);

        expect(feedRes.statusCode).toBe(200);
        expect(feedRes.body.data.length).toBeGreaterThan(0);
    });
});