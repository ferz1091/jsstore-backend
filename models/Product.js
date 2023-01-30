const { Schema, model } = require('mongoose');

const Size = new Schema({
    size: {type: String, required: true},
    amount: {type: Number, required: true}
}, {id: false})

const Product = new Schema({
    name: {type: String, required: true},
    brand: String,
    article: {type: String, required: true},
    amount: {type: [Size], required: true},
    value: {type: Number, required: true},
    isSale: {type: {value: {type: Number, required: true}, flag: {type: Boolean, require: true}}, required: true},
    color: {type: String, required: true},
    date: {type: Date, required: true},
    description: String
})

module.exports = {
    Outerwear_male: model('Outerwear_male', Product),
    Outerwear_female: model('Outerwear_female', Product),
    Footwear_male: model('Footwear_male', Product),
    Footwear_female: model('Footwear_female', Product),
    wear_male: model('Wear_male', Product),
    wear_female: model('Wear_female', Product)
};
