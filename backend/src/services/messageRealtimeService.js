const listenersByUser = new Map();
const versionByUser = new Map();

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

function notifyUsers(userIds) {
    const uniqueUserIds = [...new Set(userIds.map((item) => String(item)))];

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

function getUserVersion(userId) {
    return versionByUser.get(String(userId)) || 0;
}

function waitForUserUpdate(userId, sinceVersion, timeoutMs = 25000) {
    if (getUserVersion(userId) > sinceVersion) {
        return Promise.resolve();
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

module.exports = {
    getUserVersion,
    notifyUsers,
    waitForUserUpdate
};
