const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { JWT_SECRET } = require('../config/constants');

class AuthService {

    async register(username, password) {
        const userExists = await userRepository.usernameExists(username);
        if (userExists) {
            const error = new Error('Username already exists');
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userRepository.create(username, hashedPassword);

        return {
            id: user.id,
            username: user.username,
        };
    }

    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username },
            JWT_SECRET, { expiresIn: '1h' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    async verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                const error = new Error('Token has expired');
                error.statusCode = 401;
                error.code = 'TOKEN_EXPIRED';
                throw error;
            }

            if (err instanceof jwt.JsonWebTokenError) {
                const error = new Error('Invalid token');
                error.statusCode = 401;
                error.code = 'TOKEN_INVALID';
                throw error;
            }

            throw err;
        }
    }

    async getUserById(userId) {
        return userRepository.findById(userId);
    }
}

module.exports = new AuthService();