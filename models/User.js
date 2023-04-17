const { Schema, model } = require('mongoose');

const User = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    phone: {type: String, default: null},
    name: {type: String, default: null},
    surname: {type: String, default: null},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    emailConfirmationCode: {type: String},
    roles: [{type: String, ref: 'Role'}]
})

module.exports = model('User', User);
