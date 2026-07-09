const walletService = require('../services/wallet.service');

exports.getWallet = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const wallet = await walletService.getWalletBalance(userId);
        res.status(200).json({
            success: true,
            data: wallet,
        });
    } catch (error) {
        next(error);
    }
};

exports.getTransactionHistory = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const transactionHistory = await walletService.getTransactionHistory(userId, limit, offset);
        res.status(200).json({
            success: true,
            data: transactionHistory,
        });
    } catch (error) {
        next(error);
    }
};

exports.deposit = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        const result = await walletService.deposit(userId, parseFloat(amount));
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.deduct = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;

        const result = await walletService.deduct(userId, parseFloat(amount));
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};