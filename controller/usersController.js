const User = require('../models/User');
const Role = require('../models/Role');
const Token = require('../models/Token');
const {allowQuery} = require('../config');
const uuid = require('uuid');
const userService = require('../service/userService');
const mailService = require('../service/mailService');

class UsersController {
    async users(req, res) {
        try {
            const query = req.query;
            let page = 1;
            if (!Object.keys(query).every(q => allowQuery.users.some(a => a === q))) {
                return res.status(400).json({ message: 'Wrong query parameters!' });
            }
            if (query.page && query.page < 1) {
                return res.status(400).json({ message: 'Page must be greater than 1' });
            } else {
                page = query.page;
            }
            const users = await User.find({}, {}, { skip: (page - 1) * 20, limit: 20 });
            return res.status(200).json(users);
        } catch (e) {
            res.status(400).json({ message: 'GET error' });
        }
    }
    async changeUserRole(req, res) {
        try {
            const {_id, role} = req.body;
            if (!_id || !role) {
                return res.status(400).json({message: 'Id or role is undefined'})
            }
            const roleObj = await Role.findOne({value: role});
            if (!roleObj) {
                return res.status(400).json({message: 'Invalid role'})
            }
            const user = await User.findOne({_id});
            if (user.roles.some(role => role === 'OWNER')) {
                return res.status(400).json({message: 'Owner role change is forbid'})
            }
            if (role === 'USER') {
                await User.updateOne({_id}, {$set: {"roles": ['USER']}});
            } else {
                await User.updateOne({_id}, {$addToSet: {"roles": [role]}});
            }
            return res.status(200).json({message: 'Role has changed'});
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'PUT error'});
        }
    }
    async deleteUser(req, res) {
        try {
            const {_id} = req.body;
            const user = await User.findOne({_id});
            if (user.roles.some(role => role === 'OWNER')) {
                return res.status(400).json({message: 'Owner cannot be deleted'});
            }
            await User.findOneAndDelete({_id});
            return res.status(200).json({message: 'User has deleted'});
        } catch (error) {
            console.log(e);
            return res.status(400).json({ error: 'DELETE error'});
        }
    }
    async getUserInfo(req, res) {
        try {
            const {id} = req.query;
            if (!id) {
                throw new Error('Invalid ID');
            }
            const user = await User.findById(req.query.id);
            if (!user) {
                throw new Error('User not found');
            }
            return res.status(200).send({
                email: user.email, 
                id: user._id, 
                isActivated: user.isActivated, 
                name: user.name, 
                surname: user.surname, 
                phone: user.phone, 
                roles: user.roles,
                favorites: user.favorites
            });
        } catch (error) {
            return res.status(400).send({error: error.message});
        }
    }
    async checkMailAvailable(req, res) {
        try {
            const {email} = req.query;
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const result = emailRegex.test(email);
            if (!result) {
                throw new Error('Invalid email.')
            }
            const user = await User.findOne({email});
            return res.status(200).send({status: !!user});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async getEmailChangeConfirmationCode(req, res) {
        try {
            const {id, email} = req.query;
            if (!id || !email) {
                throw new Error('Invalid id or email.');
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            const userWithSameEmail = await User.findOne({ email });
            if (userWithSameEmail) {
                throw new Error('User with same email is registered.')
            }
            const code = await userService.generateEmailConfirmationCode();
            await mailService.sendEmailChangeConfirmationCode(user.email, code);
            user.emailConfirmationCode = code;
            await user.save();
            return res.status(200).send({message: 'Confirmation code has been sent.'});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async getForgotPasswordCode(req, res) {
        try {
            const {email} = req.query;
            if (!email) {
                throw new Error('Invalid email.');
            }
            const user = await User.findOne({email});
            if (!user) {
                throw new Error('User with this email address not found');
            }
            const code = await userService.generateEmailConfirmationCode()
            await mailService.sendRecoveryCode(email, code);
            user.recoveryCode = code;
            await user.save();
            return res.status(200).send({ message: 'The code has been sent to the specified email'});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async validateRecoveryCode(req, res) {
        try {
            const {email, code} = req.query;
            if (!email || !code) {
                throw new Error('Invalid email or code.');
            }
            const user = await User.findOne({email});
            if (!user) {
                throw new Error('User with this email address not found');
            }
            if (user.recoveryCode !== code) {
                throw new Error('Code is not correct.');
            }
            return res.status(200).send({status: true});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async changePasswordByCode(req, res) {
        try {
            const { email, code, password } = req.body;
            if (!email) {
                throw new Error('Invalid email.');
            }
            if (!code) {
                throw new Error('Invalid code.');
            }
            if (!password || password.length < 6 || password.length > 20) {
                throw new Error('Incorrect password');
            }
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found.');
            }
            if (user.recoveryCode !== code) {
                throw new Error('Code is not correct.');
            }
            user.password = userService.hashPassword(password);
            user.recoveryCode = null;
            user.save();
            await Token.deleteMany({user: user._id});
            return res.status(200).send({ message: 'Password has been changed.' });
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async editUserInfo(req, res) {
        try {
            const {email, name, surname, phone} = req.body.info;
            const user = await User.findById(req.body.id);
            if (!user) {
                throw new Error('User not found.');
            }
            if (req.body.code && req.body.code !== user.emailConfirmationCode) {
                throw new Error('Confirmation code is wrong.')
            }
            if (email !== user.email) {
                const activationLink = await userService.generateActivationLink(email);
                user.email = email;
                user.activationLink = activationLink;
                user.isActivated = false;
                user.emailConfirmationCode = '';
            }
            if (name && user.name !== name) {
                user.name = name;
            }
            if (surname && user.surname !== surname) {
                user.surname = surname;
            }
            if (phone && user.phone !== phone) {
                user.phone = phone;
            }
            user.save();
            return res.status(200).send({
                name: user.name, 
                surname: user.surname, 
                phone: user.phone, 
                email: user.email, 
                id: user._id, 
                isActivated: user.isActivated,
                favorites: user.favorites
            });
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async resendActivationLink(req, res) {
        try {
            const {id} = req.body;
            const user = await User.findById(id);
            if (!user) {
                throw new Error ('User not found.');
            }
            await mailService.sendActivationLink(user.email, `${process.env.API_URL}/auth/activate/${user.activationLink}`);
            return res.status(200).send({message: 'Mail has been sent.'});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async changeUserPassword(req, res) {
        try {
            const {id, password, newPassword} = req.body;
            if (!password || !newPassword) {
                throw new Error('Invalid passwords.');
            }
            if (password === newPassword) {
                throw new Error('Passwords match.');
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            const isPassEquals = await userService.comparePasswords(password, user.password);
            if (!isPassEquals) {
                throw new Error('Invalid password.')
            }
            user.password = userService.hashPassword(newPassword);
            user.save();
            return res.status(200).send({message: 'Password has been changed.'});
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async getUserSessions(req, res) {
        try {
            const {id} = req.query;
            if (!id) {
                throw new Error('Invalid ID.');
            }
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found.');
            }
            const refreshToken = req.cookies.refreshToken;
            const response = await userService.getSessions(id, refreshToken);
            return res.status(200).send(response);
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
    async closeSession(req, res) {
        try {
            const {sessionId, userId} = req.body;
            if (!sessionId || !userId) {
                throw new Error('Invalid IDs.');
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found.');
            }
            await Token.findByIdAndDelete(sessionId);
            const refreshToken = req.cookies.refreshToken;
            const response = await userService.getSessions(userId, refreshToken);
            return res.status(200).send(response);
        } catch (error) {
            return res.status(400).send({ error: error.message });
        }
    }
}

module.exports = new UsersController();
