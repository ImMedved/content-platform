/*
Global test setup
- clear db
- reset redis
*/

const db = require("../db/db");
const redisClient = require("../config/redis");
const initDb = require("./initDb");

beforeAll(async () => {
    await redisClient.connectRedisIfAvailable();

    await initDb();
});

beforeEach(async () => {
    // порядок важен из-за FK
    await db.query("DELETE FROM reaction");
    await db.query("DELETE FROM comment");
    await db.query("DELETE FROM follow");
    await db.query("DELETE FROM post_content");
    await db.query("DELETE FROM post_access");
    await db.query("DELETE FROM post");
    await db.query("DELETE FROM user_role");
    await db.query("DELETE FROM session");
    await db.query("DELETE FROM user");

    if (redisClient.isOpen) {
        await redisClient.flushAll();
    }
});

afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
    await db.end();
});
