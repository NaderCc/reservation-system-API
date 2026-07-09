const movieRepository = require('../repo/movie.repo.js');

class MovieService {
    async getAllMovies(limit = 10, offset = 0) {
        return movieRepository.findAll(limit, offset);
    }
}

module.exports = new MovieService();