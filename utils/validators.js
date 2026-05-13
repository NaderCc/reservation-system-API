const { VALIDATION_RULES, RESERVATION_CONFIG } = require('../config/constants');

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
    if (username.length < VALIDATION_RULES.USERNAME.MIN_LENGTH) {
        return { valid: false, error: `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters long` };
    }
    if (!VALIDATION_RULES.USERNAME.PATTERN.test(username)) {
        return { valid: false, error: `Username can only contain ${VALIDATION_RULES.USERNAME.PATTERN_DESC}` };
    }
    return { valid: true, error: null };
};

const validatePassword = (password) => {
    if (!password) {
        return { valid: false, error: 'Password is required' };
    }
    if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
        return { valid: false, error: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters long` };
    }
    if (!VALIDATION_RULES.PASSWORD.PATTERN.test(password)) {
        return { valid: false, error: `Password must meet the required criteria` };
    }
    return { valid: true, error: null };
};