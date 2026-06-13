/*
Reaction controller
*/

const reactionService = require("../services/reactionService");

async function addReaction(req, res) {
    await reactionService.addReaction(req.user.userId, req.body);
    res.json({ data: true });
}

async function removeReaction(req, res) {
    await reactionService.removeReaction(
        req.user.userId,
        req.params.postId
    );

    res.json({ data: true });
}

async function getReactions(req, res) {
    const data = await reactionService.getReactions(req.params.postId);
    res.json({ data });
}

module.exports = {
    addReaction,
    removeReaction,
    getReactions
};