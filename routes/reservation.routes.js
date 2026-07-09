const express = require('express');
const reservationController = require('../controller/res.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, reservationController.getAllReservations);
router.post('/', authMiddleware, reservationController.createReservation);
router.put('/:id', authMiddleware, reservationController.updateReservation);
router.delete('/:id', authMiddleware, reservationController.deleteReservation);

module.exports = router;