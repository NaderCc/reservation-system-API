const { VALIDATION_CONFIG, RESERVATION_CONFIG, WALLET_CONFIG } = require('../config/constants');
// validate username and password based on the rules defined in constants.js

const validateReservationDateTime = (res_date, res_time) => {
    if (!RESERVATION_CONFIG.DATE_PATTERN.test(res_date)) {
        return { valid: false, error: 'Invalid date format. Expected YYYY-MM-DD' };
    }
    if (!RESERVATION_CONFIG.TIME_PATTERN.test(res_time)) {
        return { valid: false, error: 'Invalid time format. Expected HH:MM' };
    }
    const reservationDateTime = new Date(`${res_date}T${res_time}:00`);
    if (reservationDateTime < new Date()) {
        return { valid: false, error: 'Reservation date and time must be in the future' };
    }
    const hour = parseInt(res_time.split(':')[0], 10);
    if (hour < RESERVATION_CONFIG.MIN_HOUR || hour > RESERVATION_CONFIG.MAX_HOUR) {
        return {
            valid: false,
            error: `Reservations can only be made between ${RESERVATION_CONFIG.MIN_HOUR}:00 and ${RESERVATION_CONFIG.MAX_HOUR}:00`,
        };
    }
    return { valid: true, error: null };
};

const validateUsername = (username) => {
    if (!username) {
        return { valid: false, error: 'Username is required' };
    }
    if (username.length < VALIDATION_CONFIG.USERNAME.MIN_LENGTH) {
        return { valid: false, error: `Username must be at least ${VALIDATION_CONFIG.USERNAME.MIN_LENGTH} characters long` };
    }
    if (!VALIDATION_CONFIG.USERNAME.PATTERN.test(username)) {
        return { valid: false, error: `Username can only contain ${VALIDATION_CONFIG.USERNAME.PATTERN_DESC}` };
    }
    return { valid: true, error: null };
};

const validatePassword = (password) => {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }
    if (password.length < VALIDATION_CONFIG.PASSWORD.MIN_LENGTH) {
        return { valid: false, error: `Password must be at least ${VALIDATION_CONFIG.PASSWORD.MIN_LENGTH} characters long` };
    }
    if (!VALIDATION_CONFIG.PASSWORD.PATTERN.test(password)) {
        return { valid: false, error: `Password must meet the required criteria` };
    }
    return { valid: true, error: null };
};

const validateLogicCredentials = (username, password) => {
    if (!username || !password) {
        return { valid: false, error: 'Username and password are required' };
    }
    return { valid: true, error: null };
};

// validate wallet amounts based on the rules defined in constants.js

const validateAmount = (amount) => {
    if (amount === null || amount === undefined || amount === '') {
        return { valid: false, error: 'Amount is required' };
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (!WALLET_CONFIG.AMOUNT_PATTERN.test(amount)) {
        return { valid: false, error: "Amount must be a valid decimal number (max 2 Example: *.00)" };
    }

    if (parsedAmount < WALLET_CONFIG.MIN_AMOUNT) {
        return { valid: false, error: `Amount must be at least ${WALLET_CONFIG.MIN_AMOUNT}` };
    }

    if (parsedAmount > WALLET_CONFIG.MAX_AMOUNT) {
        return { valid: false, error: `Amount cannot exceed ${WALLET_CONFIG.MAX_AMOUNT}` };
    }

    return { valid: true, error: null };
};
// validate transaction type based on the rules defined in constants.js

const validateTransactionType = (type) => {
    if (!type) {
        return { valid: false, error: 'Transaction type is required' };
    }

    const validTypes = Object.values(WALLET_CONFIG.TRANSACTION_TYPES);
    if (!validTypes.includes(type)) {
        return { valid: false, error: `Transaction type must be one of: ${validTypes.join(', ')}` };
    }

    return { valid: true, error: null };
};
// validate user ID and wallet ID based on the rules defined in constants.js

const validateUserId = (userId) => {
    if (!userId) {
        return { valid: false, error: 'User ID is required' };
    }

    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        return { valid: false, error: 'User ID must be a positive integer' };
    }

    return { valid: true, error: null };
};

const validateWalletId = (walletId) => {
    if (!walletId) {
        return { valid: false, error: 'Wallet ID is required' };
    }

    const parsedId = parseInt(walletId, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
        return { valid: false, error: 'Wallet ID must be a positive integer' };
    }

    return { valid: true, error: null };
};

// validate deposit request and deduct request based on the rules defined in constants.js

const validateDepositRequest = (userId, amount) => {
    const userValidation = validateUserId(userId);
    if (!userValidation.valid) return userValidation;

    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) return amountValidation;

    return { valid: true, error: null };
};

const validateDeductRequest = (userId, amount) => {
    const userValidation = validateUserId(userId);
    if (!userValidation.valid) return userValidation;

    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) return amountValidation;

    return { valid: true, error: null };
};

module.exports = {
    validateReservationDateTime,
    validateUsername,
    validatePassword,
    validateLogicCredentials,
    validateAmount,
    validateTransactionType,
    validateUserId,
    validateWalletId,
    validateDepositRequest,
    validateDeductRequest,
};