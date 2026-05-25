const walletService = require('../services/wallet.service');
const walletRepository = require('../repo/wallet.repo');
const { pool } = require('../config/db');

// Mock dependencies
jest.mock('../repo/wallet.repo');
jest.mock('../config/db');

describe('Wallet Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createWalletForUser', () => {
        test('should successfully create a wallet for a new user', async() => {
            const userId = 1;
            const mockWallet = { id: 1, user_id: userId, balance: 0.00, created_at: new Date(), updated_at: new Date() };

            walletRepository.getWalletByUserId.mockResolvedValue(null);
            walletRepository.createWallet.mockResolvedValue(mockWallet);

            const result = await walletService.createWalletForUser(userId);

            expect(walletRepository.getWalletByUserId).toHaveBeenCalledWith(userId);
            expect(walletRepository.createWallet).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockWallet);
        });

        test('should throw an error if wallet already exists for user', async() => {
            const userId = 1;
            const existingWallet = { id: 1, user_id: userId, balance: 100.00 };

            walletRepository.getWalletByUserId.mockResolvedValue(existingWallet);

            try {
                await walletService.createWalletForUser(userId);
                fail('Expected an error to be thrown');
            } catch (error) {
                expect(error.message).toBe('Wallet already exists for this user');
                expect(error.statusCode).toBe(409);
                expect(walletRepository.createWallet).not.toHaveBeenCalled();
            }
        });
    });

    describe('deposit', () => {
        test('should successfully deposit money into wallet', async() => {
            const userId = 1;
            const amount = 100.00;
            const walletId = 1;
            const currentBalance = 50.00;
            const newBalance = 150.00;
            const now = new Date();

            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [{ id: walletId, user_id: userId, balance: currentBalance }] })
                    .mockResolvedValueOnce({ rows: [{ id: walletId, user_id: userId, balance: newBalance, updated_at: now }] })
                    .mockResolvedValueOnce({ rows: [{ id: 1, wallet_id: walletId, type: 'deposit', amount: amount, created_at: now }] })
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            const result = await walletService.deposit(userId, amount);

            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(result.wallet.balance).toBe(newBalance);
            expect(result.transaction.type).toBe('deposit');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
        });

        test('should throw error when depositing with invalid amount', async() => {
            try {
                await walletService.deposit(1, 'invalid');
                fail('Expected an error');
            } catch (error) {
                expect(error.statusCode).toBe(400);
            }
        });

        test('should throw error when wallet not found', async() => {
            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [] })
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            try {
                await walletService.deposit(1, 100);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toBe('Wallet not found for user');
                expect(error.statusCode).toBe(404);
            }
        });

        test('should rollback on database error', async() => {
            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, balance: 50 }] })
                    .mockRejectedValueOnce(new Error('DB error'))
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            try {
                await walletService.deposit(1, 100);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toBe('DB error');
                expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            }
        });
    });

    describe('deduct', () => {
        test('should successfully deduct money from wallet', async() => {
            const userId = 1;
            const amount = 30.00;
            const walletId = 1;
            const currentBalance = 100.00;
            const newBalance = 70.00;
            const now = new Date();

            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [{ id: walletId, user_id: userId, balance: currentBalance }] })
                    .mockResolvedValueOnce({ rows: [{ id: walletId, user_id: userId, balance: newBalance, updated_at: now }] })
                    .mockResolvedValueOnce({ rows: [{ id: 2, wallet_id: walletId, type: 'deduct', amount: amount, created_at: now }] })
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            const result = await walletService.deduct(userId, amount);

            expect(result.wallet.balance).toBe(newBalance);
            expect(result.transaction.type).toBe('deduct');
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result.transaction.amount).toBe(amount);

        });

        test('should throw error on insufficient balance', async() => {
            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, balance: 50 }] })
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            try {
                await walletService.deduct(1, 200);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toContain('Insufficient balance');
                expect(error.statusCode).toBe(409);
            }
        });

        test('should throw error when wallet not found', async() => {
            const mockClient = {
                query: jest.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockResolvedValueOnce({ rows: [] })
                    .mockResolvedValueOnce(undefined),
                release: jest.fn()
            };

            pool.connect.mockResolvedValue(mockClient);

            try {
                await walletService.deduct(1, 50);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toBe('Wallet not found for user');
                expect(error.statusCode).toBe(404);
            }
        });
    });

    describe('getWalletBalance', () => {
        test('should successfully retrieve wallet balance', async() => {
            const mockWallet = {
                id: 1,
                user_id: 1,
                balance: '150.50',
                created_at: new Date(),
                updated_at: new Date()
            };

            walletRepository.getWalletByUserId.mockResolvedValue(mockWallet);

            const result = await walletService.getWalletBalance(1);

            expect(result.balance).toBe(150.50);
            expect(typeof result.balance).toBe('number');
        });

        test('should throw error when wallet not found', async() => {
            walletRepository.getWalletByUserId.mockResolvedValue(null);

            try {
                await walletService.getWalletBalance(999);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toBe('Wallet not found for user');
                expect(error.statusCode).toBe(404);
            }
        });
    });

    describe('getTransactionHistory', () => {
        test('should successfully retrieve transaction history', async() => {
            const mockWallet = { id: 1, user_id: 1, balance: '150.50', created_at: new Date(), updated_at: new Date() };
            const mockHistory = {
                data: [
                    { id: 1, wallet_id: 1, type: 'deposit', amount: 100.00, created_at: new Date() },
                    { id: 2, wallet_id: 1, type: 'deduct', amount: 30.00, created_at: new Date() }
                ],
                total: 2
            };

            walletRepository.getWalletByUserId.mockResolvedValue(mockWallet);
            walletRepository.getTransactionHistory.mockResolvedValue(mockHistory);

            const result = await walletService.getTransactionHistory(1);

            expect(result.data.length).toBe(2);
            expect(result.total).toBe(2);
        });

        test('should throw error when wallet not found', async() => {
            walletRepository.getWalletByUserId.mockResolvedValue(null);

            try {
                await walletService.getTransactionHistory(999);
                fail('Expected an error');
            } catch (error) {
                expect(error.message).toBe('Wallet not found for user');
                expect(error.statusCode).toBe(404);
            }
        });

        test('should handle empty transaction history', async() => {
            const mockWallet = { id: 1, user_id: 1 };
            const mockHistory = { data: [], total: 0 };

            walletRepository.getWalletByUserId.mockResolvedValue(mockWallet);
            walletRepository.getTransactionHistory.mockResolvedValue(mockHistory);

            const result = await walletService.getTransactionHistory(1);

            expect(result.data.length).toBe(0);
            expect(result.total).toBe(0);
        });
    });
});