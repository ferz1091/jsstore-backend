const express = require('express');
const authController = require('../controller/authController');
const router = express.Router();
const {check} = require('express-validator');

router.post('/registration', [
    check('email', 'Email isn\'t correct').isEmail(),
    check('password', 'Password must be longer than 6 and shorter than 20 characters').isLength({min: 6, max: 20})
], authController.registration);
router.post('/login', authController.login);
router.get('/activate/:link', authController.activate);
router.post('/logout', authController.logout);
router.get('/refresh', authController.refresh);

module.exports = router;
