/*
Global test setup
- clear db
- reset redis
*/

const db = require("../src/db/db");
const redisClient = require("../src/config/redis");
const initDb = require("./initDb");

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    await initDb();
});

beforeEach(async () => {
    // порядок важен из-за FK
    await db.query("DELETE FROM follow");
    await db.query("DELETE FROM post_content");
    await db.query("DELETE FROM post_access");
    await db.query("DELETE FROM post");
    await db.query("DELETE FROM user_role");
    await db.query("DELETE FROM session");
    await db.query("DELETE FROM user");

    await redisClient.flushAll();
});

afterAll(async () => {
    await redisClient.quit();
});