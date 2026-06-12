/*
Post controller
*/

const postService = require("../services/postService");

// create
async function createPost(req, res) {
    try {
        const result = await postService.createPost(req.user.userId, req.body);
        res.json({ data: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// get one
async function getPost(req, res) {
    const data = await postService.getPost(req.params.id);
    res.json({ data });
}

// list
async function listPosts(req, res) {
    const data = await postService.listPosts();
    res.json({ data });
}

module.exports = {
    createPost,
    getPost,
    listPosts
};