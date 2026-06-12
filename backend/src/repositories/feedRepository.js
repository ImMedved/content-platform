/*
Feed repository
- get feed posts
*/

const db = require("../db/db");

async function getFeed(userId, limit = 20) {
    const [rows] = await db.query(`
        SELECT p.*
        FROM post p
        JOIN follow f ON p.author_id = f.following_id
        WHERE f.follower_id = ?
        ORDER BY p.created_at DESC
        LIMIT ?
    `, [userId, limit]);

    return rows;
}

module.exports = {
    getFeed
};