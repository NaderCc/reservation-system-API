const cinemaService = require('../services/cinema.service');
const redisClient = require('../config/redis');

const createTimeout = (ms, message) => new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    timer.unref();
});

exports.getAllCinemas = async(req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    const cacheKey = `cinemas:${limit}:${offset}`;

    try {
        let cachedData = null;
        try {
            const cacheRead = redisClient.safeGet(cacheKey, 500);
            cachedData = await Promise.race([
                cacheRead,
                createTimeout(500, 'Redis cache get timed out')
            ]);
        } catch (cacheErr) {
            console.warn('Redis read error, proceeding to DB:', cacheErr.message);
        }

        if (cachedData) {
            console.log('Redis Cache Hit for Cinemas! ⚡');
            return res.json(JSON.parse(cachedData));
        }

        console.log('Fetching Cinemas from DB...');
        const cinemas = await cinemaService.getAllCinemas(limit, offset);

        const result = {
            success: true,
            data: cinemas,
            pagination: { count: cinemas.length, limit, offset }
        };

        redisClient.safeSetEx(cacheKey, 3600, JSON.stringify(result), 500)
            .catch((writeErr) => console.warn('Redis write failed:', writeErr.message));

        return res.json(result);
    } catch (err) {
        console.error('Error in getAllCinemas:', err);
        return next(err);
    }
};

exports.updateCinema = async(req, res, next) => {
    try {
        const updatePayload = {};

        if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
            updatePayload.name = req.body.name;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'location')) {
            updatePayload.location = req.body.location;
        }

        const cinema = await cinemaService.updateCinema(req.params.id, updatePayload);

        return res.json({
            success: true,
            data: cinema,
        });
    } catch (err) {
        return next(err);
    }
};