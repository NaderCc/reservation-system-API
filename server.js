require('dotenv').config();
const express = require('express');
const authController = require('./controller/auth.controller');
const resController = require('./controller/res.controller');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 9090;

app.use(express.json());


app.post('/register', authController.register);
app.post('/login', authController.login);

app.get('/reservations', authMiddleware, resController.getAllReservations);
app.post('/reservations', authMiddleware, resController.createReservation);
app.delete('/reservations', authMiddleware, resController.deleteReservation);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});