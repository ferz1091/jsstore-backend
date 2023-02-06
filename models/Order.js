const { Schema, model } = require('mongoose');

const Order = new Schema({
    products: {
        type: [
            {
                _id: {type: String, required: true}, 
                type: {type: String, required: true}, 
                size: {type: String, required: true}, 
                amount: {type: Number, required: true}
            }
        ], required: true},
    value: {type: Number, required: true},
    username: {type: String, required: true},
    date: {type: Date, required: true},
    done: {type: Boolean, required: true},
    canceled: {type: Boolean, required: true}
})

module.exports = model('Order', Order);
