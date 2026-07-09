const cinemaRepository = require('../repo/cinema.repo');
const redisClient = require('../config/redis');

class CinemaService {
    async getAllCinemas(limit = 10, offset = 0) {
        return await cinemaRepository.findAll(limit, offset);
    }

    async updateCinema(id, data = {}) {
        const cinema = await cinemaRepository.findById(id);
        if (!cinema) {
            const error = new Error('Cinema not found');
            error.statusCode = 404;
            throw error;
        }

        const updatePayload = {};
        if (typeof data.name !== 'undefined') {
            updatePayload.name = data.name;
        }
        if (typeof data.location !== 'undefined') {
            updatePayload.location = data.location;
        }

        if (Object.keys(updatePayload).length === 0) {
            const error = new Error('No supported cinema fields provided for update');
            error.statusCode = 400;
            throw error;
        }

        const updatedCinema = await cinemaRepository.update(id, updatePayload);
        if (!updatedCinema) {
            const error = new Error('Failed to update cinema');
            error.statusCode = 500;
            throw error;
        }

        await redisClient.safeDelPattern('cinemas:*', 500).catch((err) => {
            console.warn('Cinema cache clear failed:', err.message);
        });

        return updatedCinema;
    }
}

module.exports = new CinemaService();