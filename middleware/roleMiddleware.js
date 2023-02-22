const jwt = require('jsonwebtoken');
const tokenService = require('../service/tokenService');

module.exports = function (roles) {
    return function (req, res, next) {
        if (req.method === 'OPTIONS') {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'User is not authorized' })
            }
            const userData = tokenService.validateAccessToken(token);
            if (!userData) {
                return res.status(401).json({ message: 'User is not authorized' })
            }
            req.user = userData;
            const { roles: userRoles } = jwt.verify(token, 'secret223KeY');
            let hasRole = false;
            userRoles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true
                }
            })
            if (!hasRole) {
                return res.status(403).json({message: 'You don\'t have access'})
            }
            next();
        } catch (e) {
            return res.status(401).json({ message: 'User is not authorized' })
        }
    }
}
