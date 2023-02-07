const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();
const {check} = require('express-validator');

router.post('/registration', [
    check('username', 'Name must be longer than 4 and shorter than 15 characters').isLength({min: 4, max: 15}),
    check('password', 'Password must be longer than 6 and shorter than 20 characters').isLength({min: 6, max: 20})
], authController.registration);
router.post('/login', authController.login);

module.exports = router;
