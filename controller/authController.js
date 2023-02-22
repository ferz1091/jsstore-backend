const { validationResult } = require('express-validator');
const userService = require('../service/userService');

class AuthController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Registration error', errors: errors.errors})
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message})
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password, req.headers['user-agent']);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true })
            return res.json(userData);
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message});
        }
    }
    async logout(req, res) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken', {sameSite: 'none', secure: true});
            return res.status(200).json({token});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message})
        }
    }
    async refresh(req, res) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message})
        }
    }
    async activate(req, res) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect('http://testssdsds.net');
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message});
        }
    }
}

module.exports = new AuthController();
