const path = require('path');

const CONFIG_PATH = path.resolve(__dirname, '../config/constants');

const loadConfig = () => {
    jest.resetModules();
    delete require.cache[require.resolve(CONFIG_PATH)];
    return require(CONFIG_PATH);
};

describe('config/constants', () => {
    const originalJwtSecret = process.env.JWT_SECRET;

    afterAll(() => {
        process.env.JWT_SECRET = originalJwtSecret;
    });

    test('exports expected config values when JWT_SECRET is defined', () => {
        process.env.JWT_SECRET = 'test-secret';
        const config = loadConfig();

        expect(config.JWT_SECRET).toBe('test-secret');
        expect(config.RESERVATION_CONFIG).toMatchObject({
            MIN_HOUR: 10,
            MAX_HOUR: 22,
            DURATION_MINUTES: 60,
        });
        expect(config.RESERVATION_CONFIG.DATE_PATTERN.test('2026-05-15')).toBe(true);
        expect(config.RESERVATION_CONFIG.TIME_PATTERN.test('12:30')).toBe(true);
        expect(config.VALIDATION_CONFIG.USERNAME.MIN_LENGTH).toBe(3);
        expect(config.VALIDATION_CONFIG.PASSWORD.PATTERN.test('abc123')).toBe(true);
        expect(config.HTTP_MESSAGES.UNAUTHORIZED).toBe('Invalid credentials');
    });

    test('throws an error if JWT_SECRET is missing', () => {
        delete process.env.JWT_SECRET;
        expect(() => loadConfig()).toThrow('JWT_SECRET is not defined');
    });
});