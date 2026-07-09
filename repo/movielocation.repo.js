const { pool } = require('../config/db');

class MovieLocationRepository {
    async findAll(movieId, limit = 10, offset = 0) {
        const query = `
        SELECT c.name AS cinema_name,
            c.location AS location,
            c.image_url,
            s.id AS ShowtimeId,
            s.start_time AS StartAt,
            s.end_time AS EndAt,
            s.total_seats AS TotalSeats,
            s.available_seats AS AvailableSeats,
            s.price AS Price
        FROM showtimes s
        JOIN cinemas c ON s.cinema_id = c.id
        WHERE s.movie_id = $1
        ORDER BY s.start_time ASC
        LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [movieId, limit, offset]);
        return result.rows;
    }
}

module.exports = new MovieLocationRepository();