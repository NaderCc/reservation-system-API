const JWR_SECRET = process.env.JWR_SECRET;
if (!JWR_SECRET) {
    throw new Error('JWR_SECRET is not defined');
}

const RESERVATION_CONFIG = {
    MIN_HOUR: 10,
    MAX_HOUR: 22,
    DURATION_MINUTES: 60
};

const VALIDATION_CONFIG = {
    USERNAME: {
        MIN_LENGTH: 3,
        PATTERN: /^[a-zA-Z0-9_]+$/,
        PASTERN_MESSAGE: 'Username must be at least 3 characters long and can only contain letters, numbers, and underscores.'
    },
    PASSWORD: {
        MIN_LENGTH: 6,
        PATTERN: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
        PASTERN_MESSAGE: 'Password must be at least 6 characters long and contain at least one letter and one number.'
    }
};

const HTTP_MESSAGES = {
    UNAUTHORIZED: 'Invalid credentials',
    TOKEN_INVALID: 'Invalid token',
    TOKEN_EXPIRED: 'Token has expired',
    NOT_FOUND: 'Resource not found',
    INTERNAL_ERROR: 'Internal Server Error',
    CONFLICT: 'Conflict: Resource already exists or is unavailable',
};

module.exports = {
    JWR_SECRET,
    RESERVATION_CONFIG,
    VALIDATION_CONFIG,
    HTTP_MESSAGES
};