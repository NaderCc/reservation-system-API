const reservationService = require('../services/reservation.service');
const { validateReservationDateTime } = require('../utils/validators');

exports.getAllReservations = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        const result = await reservationService.getUserReservations(userId, limit, offset);

        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                limit,
                offset,
            },
        });
    } catch (err) {
        next(err);
    }
};

exports.createReservation = async(req, res, next) => {
    try {
        const { res_date, res_time } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!res_date || !res_time) {
            return res.status(400).json({
                success: false,
                error: 'res_date and res_time are required',
            });
        }

        const validation = validateReservationDateTime(res_date, res_time);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        // Call service to handle business logic
        const reservation = await reservationService.createReservation(userId, res_date, res_time);

        res.status(201).json({
            success: true,
            data: reservation,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateReservation = async(req, res, next) => {
    try {
        const reservationId = req.params.id;
        const { res_date, res_time } = req.body;
        const userId = req.user.id;

        if (!res_date || !res_time) {
            return res.status(400).json({
                success: false,
                error: 'res_date and res_time are required',
            });
        }

        const validation = validateReservationDateTime(res_date, res_time);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error,
            });
        }

        const reservation = await reservationService.updateReservation(
            reservationId,
            userId,
            res_date,
            res_time
        );
        res.json({
            success: true,
            data: reservation,
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteReservation = async(req, res, next) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;
        await reservationService.deleteReservation(reservationId, userId);
        res.json({
            success: true,
            message: 'Reservation deleted successfully',
        });
    } catch (err) {
        next(err);
    }
};