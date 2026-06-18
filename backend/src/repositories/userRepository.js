/*
User repository
- db access for user entity
*/

const db = require("../db/db");

async function createUser({ username, email, passwordHash }) {
    const [result] = await db.query(
        "INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
        [username, email, passwordHash, username]
    );

    return result.insertId;
}

async function findByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
}

async function findById(id) {
    const [rows] = await db.query(
        "SELECT id, username, email, display_name, bio, avatar_url, status, created_at, last_login_at FROM users WHERE id = ?",
        [id]
    );

    return rows[0];
}

async function findManyByIds(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
        return [];
    }

    const placeholders = ids.map(() => "?").join(", ");
    const [rows] = await db.query(
        `SELECT id, username, email, display_name, bio, avatar_url, status, created_at, last_login_at FROM users WHERE id IN (${placeholders})`,
        ids
    );

    return rows;
}

async function updateUser(userId, fields) {
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
        if (typeof value === "undefined") {
            continue;
        }

        updates.push(`${key} = ?`);
        values.push(value);
    }

    if (updates.length === 0) {
        return findById(userId);
    }

    values.push(userId);

    await db.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
    );

    return findById(userId);
}

module.exports = {
    createUser,
    findByEmail,
    findById,
    findManyByIds,
    updateUser
};
