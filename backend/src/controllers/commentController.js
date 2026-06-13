/*
Comment controller
*/

const commentService = require("../services/commentService");

async function createComment(req, res) {
    try {
        const result = await commentService.createComment(
            req.user.userId,
            req.body
        );

        res.json({ data: result });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

async function getComments(req, res) {
    const data = await commentService.getComments(req.params.postId);
    res.json({ data });
}

async function deleteComment(req, res) {
    await commentService.deleteComment(
        req.user.userId,
        req.params.id
    );

    res.json({ data: true });
}

module.exports = {
    createComment,
    getComments,
    deleteComment
};