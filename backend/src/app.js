const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db/db");

const app = express();
const frontendDistPath = path.join(__dirname, "../../frontend/content-platform-ui/dist");

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
const messageRoutes = require("./routes/messageRoutes");

const API_PREFIX = "/api/v1";

// routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/posts`, postRoutes);
app.use(`${API_PREFIX}/follow`, followRoutes);
app.use(`${API_PREFIX}/feed`, feedRoutes);
app.use(`${API_PREFIX}/comments`, commentRoutes);
app.use(`${API_PREFIX}/reactions`, reactionRoutes);
app.use(`${API_PREFIX}/messages`, messageRoutes);

app.get("/health", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 + 1 AS result");
        res.json({ status: "ok", db: rows[0]?.result === 2 ? "ok" : "unknown" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (process.env.NODE_ENV !== "test") {
    app.use(express.static(frontendDistPath));

    app.get(/^(?!\/api\/v1|\/uploads|\/health).*/, (req, res, next) => {
        res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
            if (err) {
                next();
            }
        });
    });
}

module.exports = app;
