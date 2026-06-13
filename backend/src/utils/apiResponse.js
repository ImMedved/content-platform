function ok(res, data) {
    return res.json({ data, error: null });
}

function fail(res, status, message) {
    return res.status(status).json({ data: null, error: message });
}

module.exports = {
    ok,
    fail
};
