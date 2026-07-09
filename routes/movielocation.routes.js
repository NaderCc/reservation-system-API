const express = require('express');
const movieLocationController = require('../controller/movielocation.controller');
const router = express.Router();

router.get('/', movieLocationController.findAll);

module.exports = router;