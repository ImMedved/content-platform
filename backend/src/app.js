const express = require("express");
const cors = require("cors");
const db = require("./db/db");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// support singular path used by tests
app.use("/api/user", userRoutes);

// test api
app.get("/", (req, res) => {
    res.json({ status: "ok" });
});

// db check
app.get("/db-test", async (req, res) => {
    try {
        // simple query to test db connection
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;