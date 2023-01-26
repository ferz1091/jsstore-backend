const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();
const {check} = require('express-validator');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/registration', [
    check('username', 'Name must be longer than 4 and shorter than 15 characters').isLength({min: 4, max: 15}),
    check('password', 'Password must be longer than 6 and shorter than 15 characters').isLength({min: 6, max: 15})
], authController.registration);
router.post('/login', authController.login);
router.get('/users', roleMiddleware(['ADMIN']), authController.users);

module.exports = router;
