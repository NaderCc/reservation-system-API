const movieLocationRepository = require("../repo/movielocation.repo");

class MovieLocationService {
    async findAll(movieId, limit, offset) {
        return await movieLocationRepository.findAll(movieId, limit, offset);
    }
}

module.exports = new MovieLocationService();