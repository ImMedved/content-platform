/*
Post controller
*/

const postService = require("../services/postService");
const { ok, fail } = require("../utils/apiResponse");

// create
async function createPost(req, res) {
    try {
        const result = await postService.createPost(req.user.userId, req.body);
        ok(res, result);
    } catch (err) {
        fail(res, 400, err.message);
    }
}

// get one
async function getPost(req, res) {
    const data = await postService.getPost(req.params.id);
    ok(res, data);
}

// list
async function listPosts(req, res) {
    const data = await postService.listPosts();
    ok(res, data);
}

module.exports = {
    createPost,
    getPost,
    listPosts
};
