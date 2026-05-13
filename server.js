require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const reservationRoutes = require('./routes/reservation.routes');
const { initDb } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 9090;

app.use(helmet());

app.use(cors());

app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login/register attempts, please try again later.',
    skipSuccessfulRequests: true,
});

app.use(limiter);
app.use('/auth', authLimiter, authRoutes);
app.use('/reservations', reservationRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Resource not found',
        path: req.originalUrl,
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON in request body',
        });
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || null;

    const response = {
        success: false,
        error: message,
    };

    if (code) {
        response.code = code;
    }

    res.status(statusCode).json(response);
});

const startServer = async() => {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
});