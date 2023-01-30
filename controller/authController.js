const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
// const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const {secret, allowQuery} = require('../config');

const generateAccessToken = (id, roles) => {
    const payload = {
        id, 
        roles
    }
    return jwt.sign(payload, secret, {expiresIn: '24h'})
}

class AuthController {
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
        try {
            const { username, password } = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(400).json({message: `User ${username} did not find`})
            }
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({message: 'Wrong username or password'})
            }
            const token = generateAccessToken(user._id, user.roles);
            return res.json({token})
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: error ? error : 'Login error'})
        }
    }
    async users (req, res) {
        try {
            const query = req.query;
            let page = 1;
            if (!Object.keys(query).every(q => allowQuery.users.some(a => a === q))) {
                return res.status(400).json({message: 'Wrong query parameters!'})
            }
            if (query.page && query.page < 1) {
                return res.status(400).json({message: 'Page must be greater than 1'})
            } else {
                page = query.page;
            }
            const users = await User.find({}, {}, {skip: (page - 1) * 20, limit: 20});
            return res.status(200).json(users);
        } catch (e) {
            res.status(400).json({message: 'GET error'})
        }
    }
}

module.exports = new AuthController();
