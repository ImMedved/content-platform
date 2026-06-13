/*
Reaction controller
*/

const reactionService = require("../services/reactionService");
const { ok } = require("../utils/apiResponse");

async function addReaction(req, res) {
    await reactionService.addReaction(req.user.userId, req.body);
    ok(res, true);
}

async function removeReaction(req, res) {
    await reactionService.removeReaction(
        req.user.userId,
        req.params.postId
    );

    ok(res, true);
}

async function getReactions(req, res) {
    const data = await reactionService.getReactions(req.params.postId);
    ok(res, data);
}

module.exports = {
    addReaction,
    removeReaction,
    getReactions
};
