const { pool } = require('../config/db');

class WalletRepository {
    /**
     * Create a new wallet for a user
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Created wallet object
     */
    async createWallet(userId) {
        const result = await pool.query(
            'INSERT INTO wallets (user_id, balance) VALUES ($1, $2) RETURNING *', [userId, 0.00]
        );
        return result.rows[0];
    }

    /**
     * Get wallet by user ID
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Wallet object or null
     */
    async getWalletByUserId(userId) {
        const result = await pool.query(
            'SELECT * FROM wallets WHERE user_id = $1', [userId]
        );
        return result.rows[0] || null;
    }

    /**
     * Get wallet by wallet ID
     * @param {number} walletId - Wallet ID
     * @returns {Promise<Object>} Wallet object or null
     */
    async getWalletById(walletId) {
        const result = await pool.query(
            'SELECT * FROM wallets WHERE id = $1', [walletId]
        );
        return result.rows[0] || null;
    }

    async getWalletForUpdate(walletId) {
        const result = await pool.query(
            'SELECT * FROM wallets WHERE id = $1 FOR UPDATE', [walletId]
        );
        return result.rows[0] || null;
    }

    /**
     * Update wallet balance (internal use - use within transaction)
     * @param {number} walletId - Wallet ID
     * @param {number} newBalance - New balance amount
     * @returns {Promise<Object>} Updated wallet object
     */
    async updateBalance(walletId, newBalance) {
        const result = await pool.query(
            'UPDATE wallets SET balance = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [newBalance, walletId]
        );
        return result.rows[0];
    }

    /**
     * Add a transaction record
     * @param {number} walletId - Wallet ID
     * @param {string} type - Transaction type ('deposit' or 'deduct')
     * @param {number} amount - Transaction amount
     * @returns {Promise<Object>} Created transaction object
     */
    async addTransaction(walletId, type, amount) {
        const result = await pool.query(
            `INSERT INTO wallet_transactions (wallet_id, type, amount) 
             VALUES ($1, $2, $3) RETURNING *`, [walletId, type, amount]
        );
        return result.rows[0];
    }

    /**
     * Get transaction history for a wallet
     * @param {number} walletId - Wallet ID
     * @param {number} limit - Number of records to return
     * @param {number} offset - Offset for pagination
     * @returns {Promise<Object>} Transactions with total count
     */
    async getTransactionHistory(walletId, limit = 20, offset = 0) {
        const dataResult = await pool.query(
            `SELECT * FROM wallet_transactions 
             WHERE wallet_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`, [walletId, limit, offset]
        );

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM wallet_transactions WHERE wallet_id = $1', [walletId]
        );

        return {
            data: dataResult.rows,
            total: parseInt(countResult.rows[0].count),
        };
    }
}

module.exports = new WalletRepository();