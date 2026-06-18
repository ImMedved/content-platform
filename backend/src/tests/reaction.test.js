const request = require("supertest");
const app = require("../app");
const { apiPath, responseData, responseToken } = require("./helpers/api");

let token;
let postId;

beforeEach(async () => {
    await request(app).post(apiPath("/auth/register")).send({
        username: "reaction_user",
        email: "reaction_user@test.com",
        password: "123456"
    });

    const loginRes = await request(app).post(apiPath("/auth/login")).send({
        email: "reaction_user@test.com",
        password: "123456"
    });

    token = responseToken(loginRes);

    const postRes = await request(app)
        .post(apiPath("/posts"))
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "reaction post",
            content: [{ type: "text", value: "reaction body" }],
            access: { type: "free" }
        });

    postId = responseData(postRes).postId;
});

describe("Reaction API", () => {
    it("should add, read, and remove reaction", async () => {
        const addRes = await request(app)
            .post(apiPath("/reactions"))
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                type: "like"
            });

        expect(addRes.statusCode).toBe(200);
        expect(responseData(addRes)).toBe(true);

        const getRes = await request(app).get(apiPath(`/reactions/${postId}`));

        expect(getRes.statusCode).toBe(200);
        expect(responseData(getRes)[0].type).toBe("like");
        expect(Number(responseData(getRes)[0].count)).toBe(1);

        const removeRes = await request(app)
            .delete(apiPath(`/reactions/${postId}`))
            .set("Authorization", `Bearer ${token}`);

        expect(removeRes.statusCode).toBe(200);
        expect(responseData(removeRes)).toBe(true);

        const afterRemoveRes = await request(app).get(apiPath(`/reactions/${postId}`));

        expect(afterRemoveRes.statusCode).toBe(200);
        expect(responseData(afterRemoveRes)).toHaveLength(0);
    });

    it("should let the author view liked users", async () => {
        await request(app)
            .post(apiPath("/reactions"))
            .set("Authorization", `Bearer ${token}`)
            .send({
                postId,
                type: "like"
            });

        const likersRes = await request(app)
            .get(apiPath(`/posts/${postId}/reactions/users`))
            .set("Authorization", `Bearer ${token}`);

        expect(likersRes.statusCode).toBe(200);
        expect(responseData(likersRes)).toHaveLength(1);
        expect(responseData(likersRes)[0].username).toBe("reaction_user");
    });
});
