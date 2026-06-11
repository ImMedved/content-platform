/*
Test setup
- clear db before tests
*/

const db = require("../db/db");
const { createSchema } = require("../db/db");

beforeAll(async () => {
    // drop tables (reverse order)
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("DROP TABLE IF EXISTS session");
    await db.query("DROP TABLE IF EXISTS user_role");
    await db.query("DROP TABLE IF EXISTS post_access");
    await db.query("DROP TABLE IF EXISTS access_grant");
    await db.query("DROP TABLE IF EXISTS transaction");
    await db.query("DROP TABLE IF EXISTS wallet");
    await db.query("DROP TABLE IF EXISTS reaction");
    await db.query("DROP TABLE IF EXISTS comment");
    await db.query("DROP TABLE IF EXISTS post_content");
    await db.query("DROP TABLE IF EXISTS post");
    await db.query("DROP TABLE IF EXISTS follow");
    await db.query("DROP TABLE IF EXISTS feed_event");
    await db.query("DROP TABLE IF EXISTS tag");
    await db.query("DROP TABLE IF EXISTS user");
    await db.query("DROP TABLE IF EXISTS role");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    // create schema
    await createSchema();

    // seed roles (ignore duplicates)
    await db.query(`
        INSERT IGNORE INTO role (name) VALUES 
        ('user'), ('author'), ('admin')
    `);
});


afterAll(async () => {
    await db.end();
});