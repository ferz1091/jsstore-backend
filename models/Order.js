const { Schema, model, Types } = require('mongoose');

const OrderProduct = new Schema({
    amount: {type: Number, required: true},
    size: {type: String, required: true},
    item: {type: {_id: Types.ObjectId, gender: String}}
}, {_id: false});

const Order = new Schema({
    products: {type: [OrderProduct], required: true},
    deliveryMethod: {type: String, required: true},
    contactDetails: {
        type: {
            name: { type: String, required: true },
            surname: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true },
        },
        _id: false
    },
    deliveryDetails: {
        type: {
            city: String,
            postOffice: String,
            street: String,
            building: String,
            apartment: String
        },
        default: null,
        _id: false
    },
    userId: {type: Types.ObjectId, required: true},
    value: {type: Number, required: true},
    order_date: {type: Date, required: true},
    status_date: Date | null,
    sent_date: Date | null,
    done: {type: Boolean, required: true},
    sent: {type: Boolean, required: true},
    canceled: {type: Boolean, required: true}
})

// const Order = new Schema({
//     products: {
//         type: [
//             {
//                 _id: {type: String, required: true},
//                 gender: {type: String, required: true},
//                 order: [{size: String, amount: Number}]
//             }
//         ], required: true},
//     value: {type: Number, required: true},
//     username: {type: String, required: true},
//     order_date: {type: Date, required: true},
//     status_date: Date | null,
//     done: {type: Boolean, required: true},
//     canceled: {type: Boolean, required: true}
// })

module.exports = model('Order', Order);
