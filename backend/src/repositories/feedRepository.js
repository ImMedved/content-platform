/*
Feed repository
- get feed posts
*/

const db = require("../db/db");

async function getFeed(userId, limit = 20) {
    const [rows] = await db.query(`
        SELECT p.*
        FROM post p
        LEFT JOIN follow f
          ON p.author_id = f.following_id
         AND f.follower_id = ?
        WHERE f.follower_id IS NOT NULL OR p.author_id = ?
        ORDER BY p.created_at DESC
        LIMIT ?
    `, [userId, userId, limit]);

    return rows;
}

module.exports = {
    getFeed
};
