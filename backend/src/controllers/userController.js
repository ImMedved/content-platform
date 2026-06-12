/*
User controller
- get current user
- current user info
*/

const userRepo = require("../repositories/userRepository");

async function getMe(req, res) {
    const user = await userRepo.findById(req.user.userId);

    res.json({
        userId: user.id,
        data: user
    });
}

module.exports = {
    getMe
};