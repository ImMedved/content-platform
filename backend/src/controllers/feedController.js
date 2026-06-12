/*
Feed controller
*/

const feedService = require("../services/feedService");

async function getFeed(req, res) {
    const data = await feedService.getFeed(req.user.userId);
    res.json({ data });
}

module.exports = {
    getFeed
};