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
        "SELECT * FROM comment WHERE post_id = ? ORDER BY created_at ASC",
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