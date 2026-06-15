/*
User repository
- db access for user entity
*/

const db = require("../db/db");

// create user
async function createUser({ username, email, passwordHash }) {
    const [result] = await db.query(
        "INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
        [username, email, passwordHash, username]
    );

    return result.insertId;
}

// find by email
async function findByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    return rows[0];
}

// find by id
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

module.exports = {
    createUser,
    findByEmail,
    findById,
    findManyByIds
};
