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
        await redisClient.connect();
        console.log("Redis connected");

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (err) {
        console.error("Startup error:", err.message);
        process.exit(1);
    }
}

start();