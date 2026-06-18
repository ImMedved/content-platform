const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db/db");

const app = express();

// middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reactionRoutes = require("./routes/reactionRoutes");

const API_PREFIX = "/api/v1";

// routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/posts`, postRoutes);
app.use(`${API_PREFIX}/follow`, followRoutes);
app.use(`${API_PREFIX}/feed`, feedRoutes);
app.use(`${API_PREFIX}/comments`, commentRoutes);
app.use(`${API_PREFIX}/reactions`, reactionRoutes);

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
