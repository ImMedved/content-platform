/*
Server entry
- app start
- redis connect
*/

require("dotenv").config();

const app = require("./app");
const redisClient = require("./config/redis");

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        const redisReady = await redisClient.connectRedisIfAvailable();
        if (redisReady) {
            console.log("Redis connected");
        }

        // ensure db schema is created before starting server
        const db = require("./db/db");
        await db.createSchema();
    

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (err) {
        console.error("Startup error:", err.message);
        process.exit(1);
    }
}

start();
