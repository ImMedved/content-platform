/*
Post repository
- create post
- get post
- list posts
*/

const db = require("../db/db");

async function createPost(authorId, title, description, previewUrl = null) {
    const [res] = await db.query(
        "INSERT INTO post (author_id, title, description, preview_url, status) VALUES (?, ?, ?, ?, ?)",
        [authorId, title, description, previewUrl, "published"]
    );

    return res.insertId;
}

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

async function setAccess(postId, access) {
    await db.query(
        "INSERT INTO post_access (post_id, access_type, price) VALUES (?, ?, ?)",
        [postId, access.type, access.price || 0]
    );
}

async function syncTags(postId, tags) {
    await db.query("DELETE FROM post_tag WHERE post_id = ?", [postId]);

    if (!Array.isArray(tags) || tags.length === 0) {
        return;
    }

    for (const rawTag of tags) {
        const normalizedTag = String(rawTag || "").trim().toLowerCase();

        if (!normalizedTag) {
            continue;
        }

        await db.query(
            "INSERT INTO tag (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)",
            [normalizedTag]
        );

        const [[tag]] = await db.query(
            "SELECT id FROM tag WHERE name = ?",
            [normalizedTag]
        );

        await db.query(
            "INSERT IGNORE INTO post_tag (post_id, tag_id) VALUES (?, ?)",
            [postId, tag.id]
        );
    }
}

async function getPostById(id) {
    const [[post]] = await db.query(
        `SELECT
            p.*,
            u.username AS author_username,
            u.display_name AS authorName,
            u.avatar_url AS author_avatar_url
        FROM post p
        INNER JOIN users u ON u.id = p.author_id
        WHERE p.id = ?`,
        [id]
    );

    const [content] = await db.query(
        "SELECT * FROM post_content WHERE post_id = ? ORDER BY created_at ASC",
        [id]
    );

    const [[access]] = await db.query(
        "SELECT * FROM post_access WHERE post_id = ?",
        [id]
    );

    return { post, content, access };
}

async function getPostAccessMap(postIds) {
    if (!Array.isArray(postIds) || postIds.length === 0) {
        return new Map();
    }

    const placeholders = postIds.map(() => "?").join(", ");
    const [rows] = await db.query(
        `SELECT post_id, access_type, price FROM post_access WHERE post_id IN (${placeholders})`,
        postIds
    );

    return new Map(rows.map((row) => [Number(row.post_id), row]));
}

async function getPostContentMap(postIds) {
    if (!Array.isArray(postIds) || postIds.length === 0) {
        return new Map();
    }

    const placeholders = postIds.map(() => "?").join(", ");
    const [rows] = await db.query(
        `SELECT id, post_id, content_type, content_url, text_content
         FROM post_content
         WHERE post_id IN (${placeholders})
         ORDER BY created_at ASC`,
        postIds
    );

    const map = new Map();

    for (const row of rows) {
        const postId = Number(row.post_id);
        const items = map.get(postId) || [];
        items.push(row);
        map.set(postId, items);
    }

    return map;
}

async function getPostTagMap(postIds) {
    if (!Array.isArray(postIds) || postIds.length === 0) {
        return new Map();
    }

    const placeholders = postIds.map(() => "?").join(", ");
    const [rows] = await db.query(
        `SELECT pt.post_id, t.name
         FROM post_tag pt
         INNER JOIN tag t ON t.id = pt.tag_id
         WHERE pt.post_id IN (${placeholders})
         ORDER BY t.name ASC`,
        postIds
    );

    const map = new Map();

    for (const row of rows) {
        const postId = Number(row.post_id);
        const tags = map.get(postId) || [];
        tags.push(row.name);
        map.set(postId, tags);
    }

    return map;
}

async function listPosts(limit = 20, authorId = null, tag = null, includeTags = [], excludeTags = []) {
    let query = `
        SELECT
            p.*,
            u.username AS author_username,
            u.display_name AS authorName,
            u.avatar_url AS author_avatar_url
        FROM post p
        INNER JOIN users u ON u.id = p.author_id
    `;
    const params = [];
    const conditions = [];

    if (tag) {
        conditions.push(`EXISTS (
            SELECT 1
            FROM post_tag pt
            INNER JOIN tag t ON t.id = pt.tag_id
            WHERE pt.post_id = p.id AND t.name = ?
        )`);
        params.push(String(tag).trim().toLowerCase());
    }

    for (const includeTag of includeTags) {
        conditions.push(`EXISTS (
            SELECT 1
            FROM post_tag pt
            INNER JOIN tag t ON t.id = pt.tag_id
            WHERE pt.post_id = p.id AND t.name = ?
        )`);
        params.push(String(includeTag).trim().toLowerCase());
    }

    for (const excludeTag of excludeTags) {
        conditions.push(`NOT EXISTS (
            SELECT 1
            FROM post_tag pt
            INNER JOIN tag t ON t.id = pt.tag_id
            WHERE pt.post_id = p.id AND t.name = ?
        )`);
        params.push(String(excludeTag).trim().toLowerCase());
    }

    if (authorId) {
        conditions.push("p.author_id = ?");
        params.push(authorId);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " GROUP BY p.id ORDER BY p.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(query, params);

    return rows;
}

async function listTags(query = "", limit = 8) {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    const safeLimit = Math.max(1, Math.min(Number(limit) || 8, 20));

    if (!normalizedQuery) {
        const [rows] = await db.query(
            "SELECT name FROM tag ORDER BY name ASC LIMIT ?",
            [safeLimit]
        );
        return rows.map((row) => row.name);
    }

    const likeValue = `%${normalizedQuery}%`;
    const prefixValue = `${normalizedQuery}%`;
    const [rows] = await db.query(
        `SELECT name
         FROM tag
         WHERE name LIKE ?
         ORDER BY CASE WHEN name LIKE ? THEN 0 ELSE 1 END, name ASC
         LIMIT ?`,
        [likeValue, prefixValue, safeLimit]
    );

    return rows.map((row) => row.name);
}

async function listAllTags() {
    const [rows] = await db.query(
        "SELECT name FROM tag ORDER BY name ASC"
    );

    return rows.map((row) => row.name);
}

async function getPostOwner(postId) {
    const [[row]] = await db.query(
        "SELECT id, author_id, title FROM post WHERE id = ?",
        [postId]
    );

    return row || null;
}

async function getReactionUsers(postId) {
    const [rows] = await db.query(
        `SELECT
            u.id,
            u.username,
            u.display_name,
            u.avatar_url,
            r.type,
            r.created_at
         FROM reaction r
         INNER JOIN users u ON u.id = r.user_id
         WHERE r.post_id = ?
         ORDER BY r.created_at DESC`,
        [postId]
    );

    return rows;
}

module.exports = {
    createPost,
    addContent,
    setAccess,
    syncTags,
    getPostById,
    getPostAccessMap,
    getPostContentMap,
    getPostTagMap,
    listPosts,
    listTags,
    listAllTags,
    getPostOwner,
    getReactionUsers
};
