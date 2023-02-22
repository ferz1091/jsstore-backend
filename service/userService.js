const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const mailService = require('./mailService');
const tokenService = require('./tokenService');
const UserDto = require('../dto/user-dto');

class UserService {
    async registration(email, password) {
        const candidate_email = await User.findOne({ email });
        if (candidate_email) {
            throw new Error('User with the same email already exists');
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        const userRole = await Role.findOne({ value: 'USER' });
        const activationLink = uuid.v4();
        const user = new User({ email, password: hashPassword, roles: [userRole.value], activationLink });
        await mailService.sendActivationLink(email, `${process.env.API_URL}/auth/activate/${activationLink}`);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        await user.save();
        return { 
            ...tokens,
            user: userDto
        }
    }
    async login(email, password, user_agent) {
        const user = await User.findOne({email});
        if (!user) {
            throw new Error('User with current email wasn\'t found');
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw new Error('Incorrect password')
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken, user_agent);
        return {
            ...tokens,
            user: userDto
        }
    }
    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error('User isn\'t authorized')
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if (!tokenFromDB || !userData) {
            throw new Error('User isn\'t authorized')
        }
        const user = await User.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        return {
            accessToken: tokens.accessToken,
            user: userDto
        }
    }
    async activate(activationLink) {
        const user = await User.findOne({activationLink});
        if (!user) {
            throw new Error('Activation link isn\'t correct');
        }
        if (!user.isActivated) {
            user.isActivated = true;
            user.save();
        }
    }
}

module.exports = new UserService();
