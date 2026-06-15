/*
Redis config
- client init
- cache connection
*/

const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        connectTimeout: 1000,
        reconnectStrategy: false
    }
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err.message);
});

async function connectRedisIfAvailable() {
    if (redisClient.isOpen) {
        return true;
    }

    try {
        await redisClient.connect();
        return true;
    } catch (err) {
        console.warn("Redis unavailable, continuing without cache.");
        return false;
    }
}

module.exports = redisClient;
module.exports.connectRedisIfAvailable = connectRedisIfAvailable;
