const express = require('express');
const bookingController = require('../controller/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, bookingController.createBooking);

module.exports = router;
