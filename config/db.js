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
    port: parseInt(process.env.DB_PORT, 10),
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
        await pool.query(`CREATE TABLE IF NOT EXISTS POSTGRES_MIGRATIONS (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
        );`);

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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ,
                balance DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id SERIAL PRIMARY KEY,
                wallet_id INTEGER NOT NULL REFERENCES wallets(id),
                type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'deduct')),
                amount DECIMAL(8, 2) NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
            );
        `);

        const checkMigration = await pool.query(`SELECT * FROM POSTGRES_MIGRATIONS WHERE migration_name = $1`, ['001_initialize_schema']);
        console.log('Database schema initialized successfully.');
        //check migarations 
        if (checkMigration.rows.length === 0) {
            console.log("⚡ Executing Migration 002: Adding Cinemas & UUID keys...");

            await pool.query('BEGIN');

            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS cinemas (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        location VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                await pool.query(`
                    ALTER TABLE reservations 
                    ADD COLUMN cinema_id INT REFERENCES cinemas(id) ON DELETE CASCADE,
                    ADD COLUMN res_uuid UUID NOT NULL DEFAULT gen_random_uuid();
                `);

                await pool.query(`
                    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
                    ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_res_date_res_time_key;
                `);

                await pool.query(`
                    ALTER TABLE reservations ADD PRIMARY KEY (res_uuid, cinema_id);
                    ALTER TABLE reservations ADD CONSTRAINT unique_cinema_slot UNIQUE (cinema_id, res_date, res_time);
                `);

                await pool.query(
                    "INSERT INTO POSTGRES_MIGRATIONS (migration_name) VALUES ($1)", ['002_add_cinemas_vendors_and_uuid']
                );

                await pool.query('COMMIT');
                console.log("✅ Migration 002 executed successfully and changes committed!");

            } catch (migrationErr) {
                await pool.query('ROLLBACK');
                console.error("Migration 002 failed! Rolling back changes...", migrationErr);
                throw migrationErr;
            }

        } else {
            console.log("Migration 002 already executed. Skipping...");
        }

    } catch (err) {
        console.error('Error initializing database schema', err);
        process.exit(1);
    }

};

module.exports = {
    pool,
    initDb,
};