const User = require('../models/User');
const Role = require('../models/Role');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const mailService = require('./mailService');
const tokenService = require('./tokenService');
const UserDto = require('../dto/user-dto');

class UserService {
    async registration(email, password, phone, user_agent, authMethod, name, surname) {
        const candidate_email = await User.findOne({ email });
        if (candidate_email) {
            throw new Error('User with the same email already exists');
        }
        const hashPassword = authMethod === 'email' ? this.hashPassword(password) : null;
        const userRole = await Role.findOne({ value: 'USER' });
        const activationLink = await this.generateActivationLink(email);
        const user = new User({ 
            email, 
            password: hashPassword, 
            phone, 
            roles: [userRole.value], 
            activationLink, 
            favorites: {men: [], women: []},
            authMethod,
            name: name || null,
            surname: surname || null
        });
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});
        await tokenService.saveToken(userDto.id, tokens.refreshToken, user_agent);
        await user.save();
        return { 
            ...tokens,
            user: {
                ...userDto, 
                name: user.name || null, 
                surname: user.surname || null, 
                phone: user.phone || null, 
                favorites: user.favorites, 
                authMethod: user.authMethod
            },
        }
    }
    async login(email, password, isRemember, user_agent, authMethod) {
        const user = await User.findOne({email});
        if (!user) {
            throw new Error('Invalid mail or password');
        }
        if (authMethod === 'email') {
            const isPassEquals = await this.comparePasswords(password, user.password);
            if (!isPassEquals) {
                throw new Error('Invalid mail or password')
            }
        }
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({ ...userDto });
        if (!isRemember) {
            tokens.refreshToken = null;
        } else {
            await tokenService.saveToken(userDto.id, tokens.refreshToken, user_agent);
        }
        return {
            ...tokens,
            user: {
                ...userDto, 
                name: user.name || null, 
                surname: user.surname || null, 
                phone: user.phone || null, 
                favorites: user.favorites,
                authMethod: user.authMethod
            },
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
            user: {
                ...userDto, 
                name: user.name || null, 
                surname: user.surname || null, 
                phone: user.phone || null, 
                favorites: user.favorites,
                authMethod: user.authMethod
            },
            refreshToken
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
    async generateActivationLink(email) {
        const activationLink = uuid.v4();
        await mailService.sendActivationLink(email, `${process.env.API_URL}/auth/activate/${activationLink}`);
        return activationLink;
    }
    async generateEmailConfirmationCode() {
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return code;
    }
    hashPassword(password) {
        return bcrypt.hashSync(password, 7);
    }
    async comparePasswords(password, userPassword) {
        return await bcrypt.compare(password, userPassword);
    }
    async getSessions(id, token) {
        const sessions = await Token.find({ user: id });
        return sessions.map(session => {
            const device = session.user_agent.slice(session.user_agent.indexOf('(') + 1, session.user_agent.indexOf(')'));
            if (session.refreshToken === token) {
                return {
                    device,
                    id: session._id,
                    current: true
                }
            } else {
                return {
                    device,
                    id: session._id,
                }
            }
        })
    }
}

module.exports = new UserService();
