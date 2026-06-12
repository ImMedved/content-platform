/*
Feed service
- get feed
- redis cache
*/

const feedRepo = require("../repositories/feedRepository");
const redisClient = require("../config/redis");

async function getFeed(userId) {
    const cacheKey = `feed:${userId}`;
    // use cache only when redis client is connected
    if (redisClient && redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const data = await feedRepo.getFeed(userId);

        await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

        return data;
    }

    // fallback: fetch directly when no redis
    return await feedRepo.getFeed(userId);
}

async function invalidateFeed(userId) {
    const cacheKey = `feed:${userId}`;
    if (redisClient && redisClient.isOpen) {
        await redisClient.del(cacheKey);
    }
}

module.exports = {
    getFeed,
    invalidateFeed
};