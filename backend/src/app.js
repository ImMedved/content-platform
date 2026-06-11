const express = require("express");
const cors = require("cors");
const db = require("./db/db");

const app = express();

app.use(express.json());
app.use(cors());

// test api
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

// db check
app.get("/db-test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;