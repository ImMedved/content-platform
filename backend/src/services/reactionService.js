/*
Reaction service
*/

const reactionRepo = require("../repositories/reactionRepository");

async function addReaction(userId, data) {
    const { postId, type } = data;

    await reactionRepo.addReaction(userId, postId, type || "like");
}

async function removeReaction(userId, postId) {
    await reactionRepo.removeReaction(userId, postId);
}

async function getReactions(postId) {
    return await reactionRepo.getReactions(postId);
}

module.exports = {
    addReaction,
    removeReaction,
    getReactions
};