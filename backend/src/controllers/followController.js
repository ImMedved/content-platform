/*
Follow controller
*/

const followService = require("../services/followService");
const { ok } = require("../utils/apiResponse");

async function follow(req, res) {
    await followService.follow(req.user.userId, req.params.userId);
    ok(res, true);
}

async function unfollow(req, res) {
    await followService.unfollow(req.user.userId, req.params.userId);
    ok(res, true);
}

module.exports = {
    follow,
    unfollow
};
