const { Schema, model } = require('mongoose');

const Size = new Schema({
    size: {type: String, required: true},
    amount: {type: Number, required: true}
}, {_id: false});
const Color = new Schema({
    r: {type: Number, required: true},
    g: {type: Number, required: true},
    b: {type: Number, required: true}
}, {_id: false});
const Image = new Schema({
    path: {type: String, required: true},
    title: Boolean
}, {_id: false})

const Product = new Schema({
    name: {type: String, required: true},
    rating: {type: Number, required: true},
    rateAmount: {type: Number, required: true},
    brand: String,
    type: String,
    article: {type: String, required: true},
    category: {type: String, required: true},
    amount: {type: [Size], required: true},
    value: {type: Number, required: true},
    isSale: {type: {oldValue: {type: Number, required: true}, flag: {type: Boolean, required: true}}, required: true, _id: false},
    color: {type: {value: {type: String, required: true}, rgb: {type: [Color]}}, required: true, _id: false},
    date: {type: Date, required: true},
    description: String,
    properties: [String],
    images: {type: [Image], required: true},
    markers: {type: [String], required: true},
    materials: {type: [String], required: true}
})

module.exports = {
    men: model('men', Product),
    women: model('women', Product),
    productSchema: Product 
}
