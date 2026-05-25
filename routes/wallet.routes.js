const express = require('express');
const walletController = require('../controller/wallet.controller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.get('/balance', walletController.getWallet);
router.get('/transactions', walletController.getTransactionHistory);
router.post('/deposit', walletController.deposit);
router.post('/deduct', walletController.deduct);

module.exports = router;