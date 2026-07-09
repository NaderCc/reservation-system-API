const { pool } = require('../config/db');

class MovieRepository {
    async findAll(limit = 10, offset = 0) {
        const dataResult = await pool.query(
            'SELECT * FROM movies ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]
        );
        return dataResult.rows;
    }
}

module.exports = new MovieRepository();