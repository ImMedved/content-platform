/*
Feed service
- get feed
- redis cache
*/

const feedRepo = require("../repositories/feedRepository");
const redisClient = require("../config/redis");

async function getFeed(userId) {
    const cacheKey = `feed:${userId}`;
    const postService = require("./postService");

    if (redisClient && redisClient.isOpen) {
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            console.warn("Redis feed cache read failed:", err.message);
        }
    }

    const rawPosts = await feedRepo.getFeed(userId);
    const data = await postService.hydratePosts(rawPosts, userId);

    if (redisClient && redisClient.isOpen) {
        try {
            await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
        } catch (err) {
            console.warn("Redis feed cache write failed:", err.message);
        }
    }

    return data;
}

async function invalidateFeed(userId) {
    const cacheKey = `feed:${userId}`;
    if (redisClient && redisClient.isOpen) {
        try {
            await redisClient.del(cacheKey);
        } catch (err) {
            console.warn("Redis feed cache invalidation failed:", err.message);
        }
    }
}

module.exports = {
    getFeed,
    invalidateFeed
};
