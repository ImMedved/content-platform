/*
Follow service
- follow actions
- feed cache reset
*/

const followRepo = require("../repositories/followRepository");
const userRepo = require("../repositories/userRepository");
const feedService = require("./feedService");

async function follow(userId, targetId) {
    const normalizedTargetId = Number(targetId);

    if (!Number.isInteger(normalizedTargetId) || normalizedTargetId <= 0) {
        throw new Error("Invalid user id");
    }

    if (Number(userId) === normalizedTargetId) {
        throw new Error("You cannot follow yourself");
    }

    const targetUser = await userRepo.findById(normalizedTargetId);

    if (!targetUser) {
        throw new Error("User not found");
    }

    const alreadyFollowing = await followRepo.isFollowing(userId, normalizedTargetId);

    if (alreadyFollowing) {
        throw new Error("You are already following this user");
    }

    await followRepo.follow(userId, normalizedTargetId);
    await feedService.invalidateFeed(userId);
}

async function unfollow(userId, targetId) {
    const normalizedTargetId = Number(targetId);

    if (!Number.isInteger(normalizedTargetId) || normalizedTargetId <= 0) {
        throw new Error("Invalid user id");
    }

    if (Number(userId) === normalizedTargetId) {
        throw new Error("You cannot unfollow yourself");
    }

    const isFollowing = await followRepo.isFollowing(userId, normalizedTargetId);

    if (!isFollowing) {
        throw new Error("You are not following this user");
    }

    await followRepo.unfollow(userId, normalizedTargetId);
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
