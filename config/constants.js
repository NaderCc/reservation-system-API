const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}

const RESERVATION_CONFIG = {
    MIN_HOUR: 10,
    MAX_HOUR: 22,
    DURATION_MINUTES: 60,
    DATE_PATTERN: /^\d{4}-\d{2}-\d{2}$/,
    TIME_PATTERN: /^\d{2}:\d{2}$/
};

const WALLETS_VALIDATION = {

}

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

const WALLET_CONFIG = {
    MIN_AMOUNT: 0.01,
    MAX_AMOUNT: 999999.99,
    TRANSACTION_TYPES: {
        DEPOSIT: 'deposit',
        DEDUCT: 'deduct',
        WITHDRAWAL: 'withdrawal',
        REFUND: 'refund'
    },
    AMOUNT_PATTERN: /^\d+(\.\d{1,2})?$/
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
    JWT_SECRET,
    RESERVATION_CONFIG,
    VALIDATION_CONFIG,
    WALLET_CONFIG,
    HTTP_MESSAGES
};