const userRepo = require("../repositories/userRepository");
const walletRepo = require("../repositories/walletRepository");
const followRepo = require("../repositories/followRepository");
const feedService = require("./feedService");
const { saveDataUrl } = require("../utils/mediaStorage");

async function getMyProfile(userId) {
    const [user, wallet] = await Promise.all([
        userRepo.findById(userId),
        walletRepo.getWallet(userId)
    ]);

    if (!user) {
        return null;
    }

    return {
        ...user,
        wallet_balance: Number(wallet?.balance || 0)
    };
}

async function updateMyProfile(userId, data) {
    const fields = {
        display_name: data.display_name,
        bio: data.bio,
        status: data.status
    };

    if (typeof data.avatar_file === "string" && data.avatar_file.startsWith("data:")) {
        fields.avatar_url = saveDataUrl(data.avatar_file, "avatar");
    } else if (typeof data.avatar_url === "string") {
        fields.avatar_url = data.avatar_url;
    }

    const user = await userRepo.updateUser(userId, fields);
    const wallet = await walletRepo.getWallet(userId);
    const followers = await followRepo.getFollowers(userId);

    await feedService.invalidateFeed(userId);
    for (const followerId of followers) {
        await feedService.invalidateFeed(followerId);
    }

    return {
        ...user,
        wallet_balance: Number(wallet?.balance || 0)
    };
}

module.exports = {
    getMyProfile,
    updateMyProfile
};
