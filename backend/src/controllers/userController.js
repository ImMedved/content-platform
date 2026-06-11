/*
User controller
- get current user
*/

async function getMe(req, res) {
    res.json({
        userId: req.user.userId
    });
}

module.exports = {
    getMe
};