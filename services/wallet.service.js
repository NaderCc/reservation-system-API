const { pool } = require('../config/db');
const walletRepository = require('../repo/wallet.repo');
const {
    validateDepositRequest,
    validateDeductRequest,
    validateAmount
} = require('../utils/validators');
const { WALLET_CONFIG } = require('../config/constants');

class WalletService {
    /**
     * Create a wallet for a new user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Created wallet
     */
    async createWalletForUser(userId) {
        const existingWallet = await walletRepository.getWalletByUserId(userId);
        if (existingWallet) {
            const error = new Error('Wallet already exists for this user');
            error.statusCode = 409;
            throw error;
        }

        return walletRepository.createWallet(userId);
    }

    /**
     * Deposit money into wallet (using Database Transaction)
     * @param {number} userId - User ID
     * @param {number} amount - Amount to deposit
     * @returns {Promise<Object>} Updated wallet and transaction record
     */
    async deposit(userId, amount) {

        const validation = validateDepositRequest(userId, amount);
        if (!validation.valid) {
            const error = new Error(validation.error);
            error.statusCode = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const wallet = await client.query(
                'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]
            );

            if (!wallet.rows.length) {
                const error = new Error('Wallet not found for user');
                error.statusCode = 404;
                throw error;
            }

            const currentWallet = wallet.rows[0];
            const newBalance = parseFloat(currentWallet.balance) + parseFloat(amount);

            // Update wallet balance
            const updateResult = await client.query(
                'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newBalance, currentWallet.id]
            );

            const transactionResult = await client.query(
                `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount) 
                 VALUES ($1, $2, $3) RETURNING *`, [currentWallet.id, WALLET_CONFIG.TRANSACTION_TYPES.DEPOSIT, amount]
            );

            await client.query('COMMIT');

            return {
                wallet: updateResult.rows[0],
                transaction: transactionResult.rows[0],
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Deduct money from wallet (using Database Transaction)
     * @param {number} userId - User ID
     * @param {number} amount - Amount to deduct
     * @returns {Promise<Object>} Updated wallet and transaction record
     */
    async deduct(userId, amount) {
        // Validate input
        const validation = validateDeductRequest(userId, amount);
        if (!validation.valid) {
            const error = new Error(validation.error);
            error.statusCode = 400;
            throw error;
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const wallet = await client.query(
                'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]
            );

            if (!wallet.rows.length) {
                const error = new Error('Wallet not found for user');
                error.statusCode = 404;
                throw error;
            }

            const currentWallet = wallet.rows[0];
            const currentBalance = parseFloat(currentWallet.balance);
            const deductAmount = parseFloat(amount);

            if (currentBalance < deductAmount) {
                const error = new Error(`Insufficient balance. Available: ${currentBalance}, Requested: ${deductAmount}`);
                error.statusCode = 409;
                throw error;
            }

            const newBalance = currentBalance - deductAmount;

            const updateResult = await client.query(
                'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newBalance, currentWallet.id]
            );

            // Record transaction
            const transactionResult = await client.query(
                `INSERT INTO wallet_transactions (wallet_id, transaction_type, amount) 
                 VALUES ($1, $2, $3) RETURNING *`, [currentWallet.id, WALLET_CONFIG.TRANSACTION_TYPES.DEDUCT, amount]
            );

            await client.query('COMMIT');

            return {
                wallet: updateResult.rows[0],
                transaction: transactionResult.rows[0],
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get wallet balance for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Wallet data with balance
     */
    async getWalletBalance(userId) {
        const wallet = await walletRepository.getWalletByUserId(userId);

        if (!wallet) {
            const error = new Error('Wallet not found for user');
            error.statusCode = 404;
            throw error;
        }

        return {
            id: wallet.id,
            user_id: wallet.user_id,
            balance: parseFloat(wallet.balance),
            created_at: wallet.created_at,
            updated_at: wallet.updated_at,
        };
    }

    /**
     * Get transaction history for a user's wallet
     * @param {number} userId - User ID
     * @param {number} limit - Number of records
     * @param {number} offset - Pagination offset
     * @returns {Promise<Object>} Transactions with total count
     */
    async getTransactionHistory(userId, limit = 20, offset = 0) {
        const wallet = await walletRepository.getWalletByUserId(userId);

        if (!wallet) {
            const error = new Error('Wallet not found for user');
            error.statusCode = 404;
            throw error;
        }

        return walletRepository.getTransactionHistory(wallet.id, limit, offset);
    }
}

module.exports = new WalletService();