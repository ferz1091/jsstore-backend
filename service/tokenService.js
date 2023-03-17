const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, "secret223KeY", {expiresIn: '15m'});
        const refreshToken = jwt.sign(payload, "keySec22Ret", {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken
        }
    }
    async saveToken(userId, refreshToken, user_agent) {
        const tokenData = await Token.findOne({ user: userId, user_agent });
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await Token.create({user: userId, refreshToken, user_agent});
        return token;
    }
    async removeToken(refreshToken) {
        const tokenData = await Token.deleteOne({refreshToken});
        return tokenData;
    }
    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
            return userData;
        } catch (e) {
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
            return userData;
        } catch (e) {
            return null;
        }
    }
    async findToken(refreshToken) {
        const tokenData = await Token.findOne({refreshToken});
        return tokenData;
    }
}

module.exports = new TokenService();
