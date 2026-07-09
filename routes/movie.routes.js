const express = require('express');
const { getAllMovies } = require('../controller/movie.controller');
const { cacheResponse } = require('../middleware/cache.middleware');
const router = express.Router();

router.get('/', cacheResponse('movies'), getAllMovies);

module.exports = router;