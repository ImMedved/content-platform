/*
Init test DB
- create tables
*/

const fs = require("fs");
const path = require("path");
const db = require("../db/db");

module.exports = async function initDb() {
    const schema = fs.readFileSync(
        path.join(__dirname, "../../../database/schema.sql"),
        "utf-8"
    );

    const queries = schema
        .split(";")
        .map(q => q.trim())
        .filter(q => q.length);

    for (const query of queries) {
        await db.query(query);
    }
};