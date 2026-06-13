/*
User controller
- get current user
- current user info
*/

const userRepo = require("../repositories/userRepository");
const { ok } = require("../utils/apiResponse");

async function getMe(req, res) {
    const user = await userRepo.findById(req.user.userId);
    ok(res, user);
}

module.exports = {
    getMe
};
