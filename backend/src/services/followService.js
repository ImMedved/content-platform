/*
Follow service
- follow actions
- feed cache reset
*/

const followRepo = require("../repositories/followRepository");
const feedService = require("./feedService");

async function follow(userId, targetId) {
    await followRepo.follow(userId, targetId);
    await feedService.invalidateFeed(userId);
}

async function unfollow(userId, targetId) {
    await followRepo.unfollow(userId, targetId);
    await feedService.invalidateFeed(userId);
}

async function getFollowing(userId) {
    return await followRepo.getFollowing(userId);
}

module.exports = {
    follow,
    unfollow,
    getFollowing
};