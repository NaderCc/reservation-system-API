const movieLocationService = require("../services/movielocation.service");
const { validateAndSanitizePagination } = require("../utils/validators");

class MovieLocationController {
    async findAll(req, res, next) {
        try {
            const movieIdFromParams = req.params.movieId;
            const movieIdFromQuery = req.query.movieId;
            const movieId = movieIdFromParams ? movieIdFromParams : movieIdFromQuery;
            const { limit = 10, offset = 0 } = req.query;

            const parsedMovieId = Number(movieId);
            if (!Number.isInteger(parsedMovieId) || parsedMovieId <= 0) {
                return res.status(400).json({ error: "Invalid movieId parameter" });
            }

            const pagination = validateAndSanitizePagination(limit, offset);
            const locations = await movieLocationService.findAll(
                parsedMovieId,
                pagination.limit,
                pagination.offset
            );

            return res.status(200).json({
                success: true,
                count: locations.length,
                data: locations,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MovieLocationController();