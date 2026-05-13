const authService = require('../services/auth.service');
const { validateUsername, validatePassword } = require('../utils/validators');

exports.register = async(req, res, next) => {
    try {
        const { username, password } = req.body;
        let validationResult = validateUsername(username);
        if (!validationResult.valid) {
            return res.status(400).json({ error: validationResult.error });
        }

        const validation = validatePassword(password);
        if (!validation.valid) {
            return res.status(400).json({ success: false, error: validation.error });
        }

        const user = await authService.register(username, password);

        res.status(201).json({
            success: true,
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async(req, res, next) => {
    try {
        const { username, password } = req.body;

        let validationResult = validateUsername(username);
        if (!validationResult.valid) {
            return res.status(400).json({ error: validationResult.error });
        }

        validationResult = validatePassword(password);
        if (!validationResult.valid) {
            return res.status(400).json({ error: validationResult.error });
        }

        const result = await authService.login(username, password);
        res.json({
            success: true,
            data: result,
        });
    } catch (err) {
        next(err);
    }
};