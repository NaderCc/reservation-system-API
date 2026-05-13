const { pool } = require('../config/db');

class UserRepository {
    async findByUsername(username) {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1', [username]
        );
        return result.rows[0] || null;
    }

    async findById(id) {
        const result = await pool.query(
            'SELECT id, username, created_at FROM users WHERE id = $1', [id]
        );
        return result.rows[0] || null;
    }

    async create(username, hashedPassword) {
        const query = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at';
        const result = await pool.query(query, [username, hashedPassword]);
        return result.rows[0];
    }

    async getPasswordById(userId) {
        const result = await pool.query(
            'SELECT password FROM users WHERE id = $1', [userId]
        ).rows[0] || null;
        if (!result) return null;
        return result.password;
    }

    async usernameExists(username) {
        const result = await pool.query(
            'SELECT id FROM users WHERE username = $1', [username]
        );
        return result.rows.length > 0;
    }
}

module.exports = new UserRepository();