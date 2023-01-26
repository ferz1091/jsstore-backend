const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const {secret} = require('../config');

const generateAccessToken = (id, roles) => {
    const payload = {
        id, 
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

class authController {
    async registration (req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({message: 'Registration error', errors: errors.errors})
            }
            const {username, password} = req.body;
            const candidate = await User.findOne({username});
            if (candidate) {
                return res.status(400).json({ message: 'User with the same name already exists'})
            }
            const hashPassword = bcrypt.hashSync(password, 7);
            const userRole = await Role.findOne({value: 'USER'});
            const user = new User({username, password: hashPassword, roles: [userRole.value]});
            await user.save();
            return res.json({message: 'User has been registered'})
        } catch (e) {
            return res.status(400).json({message: 'Registration error'})
        }
    }
    async login (req, res) {
        let error;
        try {
            const { username, password } = req.body;
            const user = await User.findOne({username});
            if (!user) {
                error = `User ${username} did not find`;
                throw new Error();
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                error = 'Wrong username or password';
                throw new Error();
            }
            const token = generateAccessToken(user._id, user.roles);
            return res.json({token})
        } catch (e) {
            console.log(e);
            res.status(400).json({message: error ? error : 'Login error'})
        }
    }
    async users (req, res) {
        try {
            const users = await User.find();
            return res.status(200).json(users);
        } catch (e) {
            res.status(400).json({message: 'GET error'})
        }
    }
}

module.exports = new authController();
