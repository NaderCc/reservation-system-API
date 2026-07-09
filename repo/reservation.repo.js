const { pool } = require('../config/db');

class ReservationRepository {
    async findByUserId(userId, limit = 10, offset = 0) {
        const dataResult = await pool.query(
            `SELECT
                r.*,
                c.name AS cinema_name,
                m.title AS movie_title
            FROM reservations r
            JOIN showtimes s ON r.slot_id = s.id
            JOIN cinemas c ON r.cinema_id = c.id
            JOIN movies m ON s.movie_id = m.id
            WHERE r.user_id = $1
            ORDER BY r.res_date DESC
            LIMIT $2 OFFSET $3`, [userId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reservations WHERE user_id = $1', [userId]
        );

        return {
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }

    async findById(id) {
        const result = await pool.query(
            'SELECT * FROM reservations WHERE id = $1', [id]
        );
        return result.rows[0] || null;
    }

    async isTimeSlotBooked(res_date, res_time, excludeId = null) {
        let query = 'SELECT id FROM reservations WHERE res_date = $1 AND res_time = $2';
        const params = [res_date, res_time];

        if (excludeId) {
            query += ' AND id != $3';
            params.push(excludeId);
        }

        const result = await pool.query(query, params);
        return result.rows.length > 0;
    }

    async create(userId, res_date, res_time) {
        const query = 'INSERT INTO reservations (user_id, res_date, res_time) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [userId, res_date, res_time]);
        return result.rows[0];
    }


    async update(id, userId, res_date, res_time) {
        const query = 'UPDATE reservations SET res_date = $1, res_time = $2 WHERE id = $3 AND user_id = $4 RETURNING *';
        const result = await pool.query(query, [res_date, res_time, id, userId]);
        return result.rows[0] || null;
    }


    async delete(id, userId) {
        const query = 'DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(query, [id, userId]);
        return result.rows[0] || null;
    }
}

module.exports = new ReservationRepository();