const authService = require("../services/authService");

// register endpoint
async function register(req, res) {
    try {
        const result = await authService.register(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// login endpoint
async function login(req, res) {
    try {
        const result = await authService.login(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    register,
    login
};