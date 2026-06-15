/*
User controller
- get current user
- current user info
*/

const userRepo = require("../repositories/userRepository");
const followService = require("../services/followService");
const { ok, fail } = require("../utils/apiResponse");

async function getMe(req, res) {
    try {
        const user = await userRepo.findById(req.user.userId);
        ok(res, user);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

async function getUser(req, res) {
    try {
        const user = await userRepo.findById(req.params.id);
        ok(res, user || null);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

async function getMyFollowing(req, res) {
    try {
        const users = await followService.getFollowingUsers(req.user.userId);
        ok(res, users);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

async function getMyFollowers(req, res) {
    try {
        const users = await followService.getFollowerUsers(req.user.userId);
        ok(res, users);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

async function getFollowing(req, res) {
    try {
        const users = await followService.getFollowingUsers(req.params.id);
        ok(res, users);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

async function getFollowers(req, res) {
    try {
        const users = await followService.getFollowerUsers(req.params.id);
        ok(res, users);
    } catch (err) {
        fail(res, 500, err.message);
    }
}

module.exports = {
    getMe,
    getUser,
    getMyFollowing,
    getMyFollowers,
    getFollowing,
    getFollowers
};
