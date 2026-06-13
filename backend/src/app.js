const express = require("express");
const cors = require("cors");
const db = require("./db/db");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");
const commentRoutes = require("./routes/commentRoutes");
const reactionRoutes = require("./routes/reactionRoutes");

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/follow", followRoutes);
app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/reactions", reactionRoutes);

// legacy/non-versioned routes for tests and compatibility
app.use("/api/posts", postRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/feed", feedRoutes);
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