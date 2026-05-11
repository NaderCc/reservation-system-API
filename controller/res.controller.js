const pool = require('../config/db');

exports.getAllReservations = async(req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query('SELECT * FROM reservations WHERE user_id = $1 ORDER BY res_date DESC', [userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.createReservation = async(req, res) => {
    const { res_date, res_time } = req.body;
    const userId = req.user.id;
    if (!res_date || !res_time) {
        return res.status(400).json({ error: 'res_date and res_time are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(res_date) || !/^\d{2}:\d{2}$/.test(res_time)) {
        return res.status(400).json({ error: 'res_date must be in YYYY-MM-DD format and res_time must be in HH:MM format' });
    }
    if (new Date(`${res_date}T${res_time}:00`) < new Date()) {
        return res.status(400).json({ error: 'Reservation date and time must be in the future' });
    }
    if (res_time < '10:00' || res_time > '22:00') {
        return res.status(400).json({ error: 'Reservations can only be made between 10:00 and 22:00' });
    }
    if (!/^([1][0-9]|[2][0-2]):00$/.test(res_time)) {
        return res.status(400).json({ error: 'Reservations must be on the hour (e.g., 10:00, 11:00)' });
    }
    if (res_date < new Date().toISOString().split('T')[0]) {
        return res.status(400).json({ error: 'Reservation date must be today or in the future' });
    }
    try {
        const insertQuery = 'INSERT INTO reservations (user_id, res_date, res_time) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(insertQuery, [userId, res_date, res_time]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating reservation:', err);
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
};
exports.deleteReservation = async(req, res) => {
    const reservationId = req.body.id;
    const userId = req.user.id;
    try {
        const deleteQuery = 'DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING *';
        const result = await pool.query(deleteQuery, [reservationId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found or not authorized to delete' });
        }
        res.json({ message: 'Reservation deleted successfully' });
    } catch (err) {
        console.error('Error deleting reservation:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateReservation = async(req, res) => {
    const reservationId = req.body.id;
    const { res_date, res_time } = req.body;
    const userId = req.user.id;
    if (!res_date || !res_time) {
        return res.status(400).json({ error: 'res_date and res_time are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(res_date) || !/^\d{2}:\d{2}$/.test(res_time)) {
        return res.status(400).json({ error: 'res_date must be in YYYY-MM-DD format and res_time must be in HH:MM format' });
    }
    if (new Date(`${res_date}T${res_time}:00`) < new Date()) {
        return res.status(400).json({ error: 'Reservation date and time must be in the future' });
    }
    if (res_time < '10:00' || res_time > '22:00') {
        return res.status(400).json({ error: 'Reservations can only be made between 10:00 and 22:00' });
    }
    if (!/^([1][0-9]|[2][0-2]):00$/.test(res_time)) {
        return res.status(400).json({ error: 'Reservations must be on the hour (e.g., 10:00, 11:00)' });
    }
    if (res_date < new Date().toISOString().split('T')[0]) {
        return res.status(400).json({ error: 'Reservation date must be today or in the future' });
    }
    try {
        const updateQuery = 'UPDATE reservations SET res_date = $1, res_time = $2 WHERE id = $3 AND user_id = $4 RETURNING *';
        const result = await pool.query(updateQuery, [res_date, res_time, reservationId, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found or not authorized to update' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating reservation:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};