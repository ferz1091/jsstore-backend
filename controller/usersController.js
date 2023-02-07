const User = require('../models/User');
const Role = require('../models/Role');
const {allowQuery} = require('../config');

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
        } catch (e) {
            console.log(e);
            return res.status(400).json({message: 'DELETE error'});
        }
    }
}

module.exports = new UsersController();
