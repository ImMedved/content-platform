/*
Auth service
- register user
- login user
- password hashing
- jwt generation
- session storage

- jwt + sessions
*/

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepo = require("../repositories/userRepository");
const roleRepo = require("../repositories/roleRepository");
const sessionRepo = require("../repositories/sessionRepository");
const walletRepo = require("../repositories/walletRepository");
const { getEmailHash, normalizeEmail } = require("../utils/emailSecurity");

// register
async function register(data) {
    const { username, email, password } = data;
    const normalizedEmail = normalizeEmail(email);
    const emailHash = getEmailHash(normalizedEmail);

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await userRepo.createUser({
        username,
        emailHash,
        passwordHash
    });

    const role = await roleRepo.getRoleByName("user");

    await roleRepo.assignRole(userId, role.id);
    await walletRepo.createWallet(userId, 100);

    return { userId };
}

// login
async function login(data) {
    const { email, password } = data;
    const emailHash = getEmailHash(email);

    const user = await userRepo.findByEmailHash(emailHash);

    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error("Invalid password");

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    await sessionRepo.createSession(user.id, token);

    return { token };
}

module.exports = {
    register,
    login
};
