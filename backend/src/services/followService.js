/*
Follow service
- follow actions
- feed cache reset
*/

const followRepo = require("../repositories/followRepository");
const userRepo = require("../repositories/userRepository");
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

async function getFollowingUsers(userId) {
    const ids = await followRepo.getFollowing(userId);
    return await userRepo.findManyByIds(ids);
}

async function getFollowerUsers(userId) {
    const ids = await followRepo.getFollowers(userId);
    return await userRepo.findManyByIds(ids);
}

module.exports = {
    follow,
    unfollow,
    getFollowing,
    getFollowingUsers,
    getFollowerUsers
};
