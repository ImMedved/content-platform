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
    try {
        const data = await postService.getPost(req.params.id);
        ok(res, data);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

// list
async function listPosts(req, res) {
    try {
        const data = await postService.listPosts({
            limit: req.query.limit,
            authorId: req.query.authorId
        });
        ok(res, data);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

module.exports = {
    createPost,
    getPost,
    listPosts
};
