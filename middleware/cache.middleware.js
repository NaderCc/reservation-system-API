const redisClient = require('../config/redis');

const cacheResponse = (prefix) => async(req, res, next) => {
    const queryString = JSON.stringify(req.query);
    const cacheKey = `${prefix}:${queryString}`;

    try {
        const cachedData = await redisClient.safeGet(cacheKey, 350).catch(() => null);

        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(JSON.parse(cachedData));
        }

        const originalSend = res.json;
        res.json = function(data) {
            originalSend.call(this, data);
            if (data && data.success) {
                redisClient.safeSetEx(cacheKey, 3600, JSON.stringify(data), 500)
                    .catch((err) => console.warn('Cache write failed:', err.message));
            }
        };

        next();
    } catch (err) {
        console.error('Cache middleware error:', err);
        next();
    }
};

module.exports = { cacheResponse };