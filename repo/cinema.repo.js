const { pool } = require('../config/db');

class CinemaRepository {
    async findAll(limit = 10, offset = 0) {
        const query = `
            SELECT id, name, location, image_url 
            FROM cinemas 
            ORDER BY id DESC 
            LIMIT $1 OFFSET $2
        `;

        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    async findById(id) {
        const query = `
            SELECT id, name, location, image_url
            FROM cinemas
            WHERE id = $1
        `;

        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    }

    async update(id, data) {
        const entries = Object.entries(data);
        if (entries.length === 0) {
            return null;
        }

        const columns = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...entries.map(([, value]) => value)];

        const query = `
            UPDATE cinemas
            SET ${columns}
            WHERE id = $1
            RETURNING id, name, location, image_url
        `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }
}

module.exports = new CinemaRepository();