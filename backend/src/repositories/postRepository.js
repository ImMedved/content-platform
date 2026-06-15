/*
Post repository
- create post
- get post
- list posts
*/

const db = require("../db/db");

// create post
async function createPost(authorId, title, description) {
    const [res] = await db.query(
        "INSERT INTO post (author_id, title, description) VALUES (?, ?, ?)",
        [authorId, title, description]
    );

    return res.insertId;
}

// add content
async function addContent(postId, content) {
    for (const item of content) {
        await db.query(
            "INSERT INTO post_content (post_id, content_type, content_url, text_content) VALUES (?, ?, ?, ?)",
            [
                postId,
                item.type,
                item.type === "text" ? null : item.value,
                item.type === "text" ? item.value : null
            ]
        );
    }
}

// set access
async function setAccess(postId, access) {
    await db.query(
        "INSERT INTO post_access (post_id, access_type, price) VALUES (?, ?, ?)",
        [postId, access.type, access.price || 0]
    );
}

// get post
async function getPostById(id) {
    const [[post]] = await db.query(
        `SELECT
            p.*,
            u.username AS author_username,
            u.display_name AS authorName
        FROM post p
        INNER JOIN users u ON u.id = p.author_id
        WHERE p.id = ?`,
        [id]
    );

    const [content] = await db.query(
        "SELECT * FROM post_content WHERE post_id = ?",
        [id]
    );

    const [[access]] = await db.query(
        "SELECT * FROM post_access WHERE post_id = ?",
        [id]
    );

    return { post, content, access };
}

// list posts
async function listPosts(limit = 20, authorId = null) {
    let query = `
        SELECT
            p.*,
            u.username AS author_username,
            u.display_name AS authorName
        FROM post p
        INNER JOIN users u ON u.id = p.author_id
    `;
    const params = [];

    if (authorId) {
        query += " WHERE p.author_id = ?";
        params.push(authorId);
    }

    query += " ORDER BY p.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(query, params);

    return rows;
}

module.exports = {
    createPost,
    addContent,
    setAccess,
    getPostById,
    listPosts
};
