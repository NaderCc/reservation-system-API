const movieService = require("../services/movie.service");
const redisClient = require('../config/redis'); // الـ ioredis اللي اشتغل معانا

const createTimeout = (ms, message) => new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    timer.unref();
});

exports.getAllMovies = async(req, res, next) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    const cacheKey = `movies:${limit}:${offset}`;

    try {
        let cachedData = null;

        try {
            const cacheRead = redisClient.safeGet(cacheKey, 500);
            cachedData = await Promise.race([
                cacheRead,
                createTimeout(500, 'Redis cache get timed out after 500ms')
            ]);
        } catch (cacheErr) {
            console.warn('Redis cache get failed or timed out:', cacheErr.message);
        }

        if (cachedData) {
            console.log('Redis Cache Hit! ⚡');
            return res.json(JSON.parse(cachedData));
        }

        console.log('Cache miss or Redis unavailable, fetching from DB...');
        const movies = await movieService.getAllMovies(limit, offset);
        const result = {
            success: true,
            data: movies,
            pagination: { total: movies.length, limit, offset }
        };

        redisClient.safeSetEx(cacheKey, 3600, JSON.stringify(result), 500)
            .catch((writeErr) => console.warn('Redis cache write failed:', writeErr.message));

        return res.json(result);
    } catch (err) {
        console.error('Error in getAllMovies:', err);
        return next(err);
    }
};