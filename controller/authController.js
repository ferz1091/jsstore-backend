const { validationResult } = require('express-validator');
const userService = require('../service/userService');
const isDev = process.env.MODE === 'development' || !process.env.MODE ? true : false;

class AuthController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Registration error', errors: errors.errors})
            }
            const {email, password, phone} = req.body;
            const userData = await userService.registration(email, password, phone, req.headers['user-agent']);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev })
            return res.json(userData);
        } catch (error) {
            console.log(error);
            return res.status(400).send({error: error.message})
        }
    }
    async login(req, res) {
        try {
            const { email, password, isRemember } = req.body;
            const userData = await userService.login(email, password, isRemember, req.headers['user-agent']);
            if (isRemember) {
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev })
            }
            return res.json(userData);
        } catch (error) {
            return res.status(400).send({error: error.message});
        }
    }
    async logout(req, res) {
        try {
            const {refreshToken} = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken', { sameSite: isDev ? 'Lax' : 'None', secure: !isDev });
            return res.status(200).json({token});
        } catch (error) {
            console.log(error);
            return res.status(400).send({error: error.message})
        }
    }
    async refresh(req, res) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev });
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
            return res.redirect('https://jsstore-frontend.vercel.app');
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message});
        }
    }
}

module.exports = new AuthController();
