/*
User repository
- db access for user entity
*/

const db = require("../db/db");

// create user
async function createUser({ username, email, passwordHash }) {
    const [result] = await db.query(
        "INSERT INTO user (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
        [username, email, passwordHash, username]
    );

    return result.insertId;
}

// find by email
async function findByEmail(email) {
    const [rows] = await db.query(
        "SELECT * FROM user WHERE email = ?",
        [email]
    );

    return rows[0];
}

module.exports = {
    createUser,
    findByEmail
};