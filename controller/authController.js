const { validationResult } = require('express-validator');
const userService = require('../service/userService');
const User = require('../models/User');
const isDev = process.env.MODE === 'development' || !process.env.MODE ? true : false;

class AuthController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw new Error('Registration error');
            }
            const {email, password, phone} = req.body;
            const userData = await userService.registration(email, password, phone, req.headers['user-agent'], 'email');
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev })
            return res.status(200).send(userData);
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
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev });
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
            return res.redirect('http://localhost:5173');
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: e.message});
        }
    }
    async googleAuth(req, res) {
        try {
            const client_id = '874600186480-fi546clggocci41u6tth5eirirg50gpc.apps.googleusercontent.com';
            const client_secret = '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';
            let access_token;
            let user_info;
            let testInfo;
            const { code } = req.body;
            if (!code) {
                throw new Error('Invalid code.');
            }
            await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                body: new URLSearchParams({
                    code,
                    client_id,
                    client_secret,
                    redirect_uri: 'https://jsstore-frontend.vercel.app/#/authback',
                    grant_type: 'authorization_code'
                })
            })
            .then(response => response.json())
            .then(body => {
                testInfo = body;
                access_token = body.access_token});
            if (!access_token) {
                throw new Error('Something goes wrong');
            }
            await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(response => response.json())
            .then(body => user_info = {
                email: body.email,
                name: body.given_name || null,
                surname: body.family_name || null
            });
            const user = await User.findOne({email: user_info.email});
            if (!user) {
                const userData = await userService.registration(user_info.email, null, null, req.headers['user-agent'], 'google', user_info.name, user_info.surname);
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev });
                return res.status(200).send(userData);
            } else {
                const userData = await userService.login(user_info.email, null, true, req.headers['user-agent'], 'google');
                res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: isDev ? 'Lax' : 'None', secure: !isDev });
                return res.status(200).send(userData);
            }
        } catch (error) {
            return res.status(400).send({message: error.message, info: testInfo})
        }
    }
}

module.exports = new AuthController();
