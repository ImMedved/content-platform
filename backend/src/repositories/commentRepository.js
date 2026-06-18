/*
Comment repository
- create comment
- get comments
- delete comment
*/

const db = require("../db/db");

async function createComment(postId, userId, content) {
    const [res] = await db.query(
        "INSERT INTO comment (post_id, author_id, content) VALUES (?, ?, ?)",
        [postId, userId, content]
    );

    return res.insertId;
}

async function getComments(postId) {
    const [rows] = await db.query(
        `SELECT
            c.*,
            u.username AS author_username,
            u.display_name AS authorName,
            u.avatar_url AS author_avatar_url
        FROM comment c
        INNER JOIN users u ON u.id = c.author_id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC`,
        [postId]
    );

    return rows;
}

async function deleteComment(commentId, userId) {
    await db.query(
        "DELETE FROM comment WHERE id = ? AND author_id = ?",
        [commentId, userId]
    );
}

module.exports = {
    createComment,
    getComments,
    deleteComment
};
