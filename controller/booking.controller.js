const bookingService = require('../services/booking.service');

exports.createBooking = async(req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const { slotId, seatsCount } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
        }

        const parsedSlotId = Number(slotId);
        const parsedSeatsCount = Number(seatsCount);

        if (!Number.isInteger(parsedSlotId) || parsedSlotId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'slotId must be a positive integer',
            });
        }

        if (!Number.isInteger(parsedSeatsCount) || parsedSeatsCount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'seatsCount must be a positive integer',
            });
        }

        const result = await bookingService.createBooking(
            userId,
            parsedSlotId,
            parsedSeatsCount
        );

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};