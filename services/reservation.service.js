const reservationRepository = require('../repo/reservation.repo');

class ReservationService {
    async getUserReservations(userId, limit = 10, offset = 0) {
        return reservationRepository.findByUserId(userId, limit, offset);
    }

    async createReservation(userId, res_date, res_time) {
        // Check for conflicts (double-booking)
        const isBooked = await reservationRepository.isTimeSlotBooked(res_date, res_time);
        if (isBooked) {
            const error = new Error('This time slot is already booked');
            error.statusCode = 409;
            throw error;
        }

        return reservationRepository.create(userId, res_date, res_time);
    }

    async updateReservation(reservationId, userId, res_date, res_time) {
        // Check if reservation exists and belongs to user
        const reservation = await reservationRepository.findById(reservationId);
        if (!reservation || reservation.user_id !== userId) {
            const error = new Error('Reservation not found or not authorized to update');
            error.statusCode = 404;
            throw error;
        }

        const isBooked = await reservationRepository.isTimeSlotBooked(res_date, res_time, reservationId);
        if (isBooked) {
            const error = new Error('This time slot is already booked');
            error.statusCode = 409;
            throw error;
        }

        return reservationRepository.update(reservationId, userId, res_date, res_time);
    }

    async deleteReservation(reservationId, userId) {
        const result = await reservationRepository.delete(reservationId, userId);
        if (!result) {
            const error = new Error('Reservation not found or not authorized to delete');
            error.statusCode = 404;
            throw error;
        }
        return result;
    }
}

module.exports = new ReservationService();