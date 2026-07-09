const express = require('express');
const { getAllCinemas, updateCinema } = require('../controller/cinema.controller');
const { cacheResponse } = require('../middleware/cache.middleware');
const router = express.Router();

router.get('/', cacheResponse('cinemas'), getAllCinemas);
router.put('/:id', updateCinema);
router.patch('/:id', updateCinema);

module.exports = router;