const { Schema, model } = require('mongoose');

const Favorites = new Schema({
    men: {type: [String]},
    women: {type: [String]}
}, {_id: false});

const User = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String},
    phone: {type: String, default: null},
    name: {type: String, default: null},
    surname: {type: String, default: null},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    emailConfirmationCode: {type: String},
    recoveryCode: {type: String},
    roles: [{type: String, ref: 'Role'}],
    favorites: {type: Favorites},
    authMethod: {type: String, required: true}
})

module.exports = model('User', User);
