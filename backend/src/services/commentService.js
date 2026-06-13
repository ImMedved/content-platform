/*
Comment service
*/

const commentRepo = require("../repositories/commentRepository");

async function createComment(userId, data) {
    const { postId, content } = data;

    const commentId = await commentRepo.createComment(postId, userId, content);

    return { commentId };
}

async function getComments(postId) {
    return await commentRepo.getComments(postId);
}

async function deleteComment(userId, commentId) {
    await commentRepo.deleteComment(commentId, userId);
}

module.exports = {
    createComment,
    getComments,
    deleteComment
};