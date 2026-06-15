/*
DB config
- switch env (test/dev)
*/

const mysql = require("mysql2/promise");
require("dotenv").config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// create pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// read and execute schema
async function createSchema() {
    const schemaPath = path.join(__dirname, "../../../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    
    // Split by semicolon and execute each statement
    const statements = schema
        .split(";")
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
        try {
            await pool.query(statement);
        } catch (err) {
            if (err && (err.code === "ER_TABLE_EXISTS_ERROR" || err.code === "ER_DUP_ENTRY")) {
                continue;
            }

            throw err;
        }
    }
}

module.exports = pool;
module.exports.createSchema = createSchema;
