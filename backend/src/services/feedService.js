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
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const rawPosts = await feedRepo.getFeed(userId);
        const data = await postService.hydratePosts(rawPosts, userId);

        await redisClient.setEx(cacheKey, 60, JSON.stringify(data));

        return data;
    }

    const rawPosts = await feedRepo.getFeed(userId);
    return postService.hydratePosts(rawPosts, userId);
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
