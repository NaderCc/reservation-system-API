const { pool } = require("../config/db");
const { WALLET_CONFIG } = require("../config/constants");

class BookingService {
    async createBooking(userId, slotId, seatsCount) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const slotQuery = `
                SELECT id, cinema_id, price, available_seats, start_time
                FROM showtimes
                WHERE id = $1
                FOR UPDATE;
            `;
            const slotResult = await client.query(slotQuery, [slotId]);
            if (slotResult.rows.length === 0) {
                throw new Error('الحفلة المطلوبة غير موجودة.');
            }

            const slot = slotResult.rows[0];
            if (slot.available_seats < seatsCount) {
                throw new Error(`الكراسي المتاحة غير كافية. المتبقي: ${slot.available_seats}`);
            }

            const totalPrice = parseFloat(slot.price) * seatsCount;

            const walletQuery = `
                SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE;
            `;
            const walletResult = await client.query(walletQuery, [userId]);
            if (walletResult.rows.length === 0) {
                throw new Error('المستخدم ليس لديه محفظة.');
            }

            const wallet = walletResult.rows[0];
            if (parseFloat(wallet.balance) < totalPrice) {
                throw new Error(`رصيدك غير كافي. المطلوب: ${totalPrice}، المتاح: ${wallet.balance}`);
            }

            const walletId = wallet.id;
            const newBalance = parseFloat(wallet.balance) - totalPrice;
            await client.query(
                'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2', [newBalance, walletId]
            );

            await client.query(
                `INSERT INTO wallet_transactions (wallet_id, "type", amount) VALUES ($1, $2, $3)`, [walletId, WALLET_CONFIG.TRANSACTION_TYPES.DEDUCT, totalPrice]
            );

            await client.query(
                'UPDATE showtimes SET available_seats = available_seats - $1 WHERE id = $2', [seatsCount, slotId]
            );

            const { v4: uuidv4 } = require('uuid');
            const resUuid = uuidv4();
            const slotDate = slot.start_time.toISOString().split('T')[0];
            const slotTime = slot.start_time.toTimeString().split(' ')[0];

            const insertReservationQuery = `
                INSERT INTO reservations (
                    user_id, cinema_id, res_date, res_time, res_uuid, slot_id, seats_count, total_price, status, created_at
                ) VALUES ($1, $2, $3::date, $4::time, $5, $6, $7, $8, 'pending', NOW())
                RETURNING id, res_uuid;
            `;

            const reservationResult = await client.query(insertReservationQuery, [
                userId,
                slot.cinema_id,
                slotDate,
                slotTime,
                resUuid,
                slotId,
                seatsCount,
                totalPrice
            ]);

            const bookingId = reservationResult.rows[0].id;

            await client.query(
                'UPDATE reservations SET status = $1 WHERE id = $2', ['confirmed', bookingId]
            );

            await client.query('COMMIT');

            return {
                success: true,
                message: 'تم الحجز بنجاح واقتطاع المبلغ من المحفظة!',
                bookingId,
                uuid: resUuid,
                totalPrice,
                status: 'confirmed'
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Booking Transaction]: ${error.message}`);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new BookingService();