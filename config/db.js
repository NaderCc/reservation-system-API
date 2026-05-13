const { Pool } = require('pg');
require('dotenv').config();

// check the environment variables
if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD || !process.env.DB_PORT) {
    console.error('Database configuration environment variables are not properly set');
    process.exit(1);
}

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
    console.log('Connected to the PostgreSQL database successfully!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

const initDb = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                res_date DATE NOT NULL,
                res_time TIME NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                UNIQUE (res_date, res_time)
            );
        `);

        console.log('Database schema initialized successfully.');
    } catch (err) {
        console.error('Error initializing database schema', err);
        process.exit(1);
    }
};

module.exports = {
    pool,
    initDb,
};