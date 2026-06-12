/*
Follow controller
*/

const followService = require("../services/followService");

async function follow(req, res) {
    await followService.follow(req.user.userId, req.params.userId);
    res.json({ data: true });
}

async function unfollow(req, res) {
    await followService.unfollow(req.user.userId, req.params.userId);
    res.json({ data: true });
}

module.exports = {
    follow,
    unfollow
};
