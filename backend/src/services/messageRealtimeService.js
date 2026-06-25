const redisClient = require("../config/redis");
const { createRedisSubscriberIfAvailable } = require("../config/redis");

const listenersByUser = new Map();
const versionByUser = new Map();

function getVersionKey(userId) {
    return `messages:user:${userId}:version`;
}

function getChannelName(userId) {
    return `messages:user:${userId}:events`;
}

function addListener(userId, listener) {
    const key = String(userId);
    const listeners = listenersByUser.get(key) || new Set();
    listeners.add(listener);
    listenersByUser.set(key, listeners);

    return () => {
        const currentListeners = listenersByUser.get(key);

        if (!currentListeners) {
            return;
        }

        currentListeners.delete(listener);

        if (currentListeners.size === 0) {
            listenersByUser.delete(key);
        }
    };
}

async function notifyUsers(userIds) {
    const uniqueUserIds = [...new Set(userIds.map((item) => String(item)))];

    if (redisClient.isOpen) {
        const pipeline = redisClient.multi();

        for (const userId of uniqueUserIds) {
            pipeline.incr(getVersionKey(userId));
            pipeline.publish(getChannelName(userId), "message");
        }

        await pipeline.exec();
        return;
    }

    for (const userId of uniqueUserIds) {
        versionByUser.set(userId, (versionByUser.get(userId) || 0) + 1);
        const listeners = listenersByUser.get(userId);

        if (!listeners) {
            continue;
        }

        for (const listener of [...listeners]) {
            listener();
        }
    }
}

async function getUserVersion(userId) {
    if (redisClient.isOpen) {
        const version = await redisClient.get(getVersionKey(userId));
        return Number(version || 0);
    }

    return versionByUser.get(String(userId)) || 0;
}

async function waitForLocalUserUpdate(userId, sinceVersion, timeoutMs) {
    if ((versionByUser.get(String(userId)) || 0) > sinceVersion) {
        return;
    }

    return new Promise((resolve) => {
        let timeoutId = null;
        let unsubscribe = null;

        const finish = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (unsubscribe) {
                unsubscribe();
            }

            resolve();
        };

        unsubscribe = addListener(userId, finish);
        timeoutId = setTimeout(finish, timeoutMs);
    });
}

async function waitForUserUpdate(userId, sinceVersion, timeoutMs = 25000) {
    const currentVersion = await getUserVersion(userId);

    if (currentVersion > sinceVersion) {
        return;
    }

    if (!redisClient.isOpen) {
        await waitForLocalUserUpdate(userId, sinceVersion, timeoutMs);
        return;
    }

    const subscriber = await createRedisSubscriberIfAvailable();

    if (!subscriber) {
        await waitForLocalUserUpdate(userId, sinceVersion, timeoutMs);
        return;
    }

    await new Promise((resolve) => {
        let completed = false;
        let timeoutId = null;

        const finish = async () => {
            if (completed) {
                return;
            }

            completed = true;

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            try {
                await subscriber.unsubscribe(getChannelName(userId));
            } catch (err) {
            }

            try {
                await subscriber.quit();
            } catch (err) {
            }

            resolve();
        };

        timeoutId = setTimeout(() => {
            finish();
        }, timeoutMs);

        subscriber.subscribe(getChannelName(userId), async () => {
            await finish();
        }).catch(async () => {
            await finish();
        });
    });
}

module.exports = {
    getUserVersion,
    notifyUsers,
    waitForUserUpdate
};
