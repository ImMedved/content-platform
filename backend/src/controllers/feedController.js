/*
Feed controller
*/

const feedService = require("../services/feedService");
const { ok } = require("../utils/apiResponse");

async function getFeed(req, res) {
    const data = await feedService.getFeed(req.user.userId);
    ok(res, data);
}

module.exports = {
    getFeed
};
