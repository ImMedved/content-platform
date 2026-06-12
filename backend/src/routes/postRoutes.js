const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

// protected
router.post("/", authMiddleware, postController.createPost);

// public
router.get("/", postController.listPosts);
router.get("/:id", postController.getPost);

module.exports = router;