/*
Follow controller
*/

const followService = require("../services/followService");
const { ok, fail } = require("../utils/apiResponse");

async function follow(req, res) {
    try {
        await followService.follow(req.user.userId, req.params.userId);
        ok(res, true);
    } catch (err) {
        fail(res, 400, err.message);
    }
}

async function unfollow(req, res) {
    try {
        await followService.unfollow(req.user.userId, req.params.userId);
        ok(res, true);
    } catch (err) {
        fail(res, 400, err.message);
    }
}

module.exports = {
    follow,
    unfollow
};
