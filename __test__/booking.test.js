const bookingService = require('../services/booking.service');
const { pool } = require('../config/db');
const redisClient = require('../config/redis');

jest.mock('../config/db');
jest.mock('../config/redis');

describe('BookingService transaction flow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should create a booking and update it from pending to confirmed inside a transaction', async() => {
        const client = {
            query: jest.fn()
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce({ rows: [{ id: 99, status: 'pending' }] })
                .mockResolvedValueOnce(undefined)
                .mockResolvedValueOnce(undefined),
            release: jest.fn()
        };

        pool.connect.mockResolvedValue(client);
        redisClient.safeLpush.mockResolvedValue(1);

        const result = await bookingService.createBooking(7, 12, 2);

        expect(result.success).toBe(true);
        expect(result.status).toBe('confirmed');
        expect(client.query).toHaveBeenCalledWith('BEGIN');
        expect(client.query).toHaveBeenCalledWith('COMMIT');
        expect(redisClient.safeLpush).toHaveBeenCalledWith(
            'booking:queue',
            expect.stringContaining('"bookingId":99'),
            500
        );
    });
});