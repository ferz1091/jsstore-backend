const { Schema, model, Types } = require('mongoose');

const Comment = new Schema({
    user: {type: String, required: true},
    rating: {type: Number, default: null},
    comment: {type: String},
    date: {type: Date},
    answer: {type: String}
}, {_id: false});

const Rating = new Schema({
    productId: {type: Types.ObjectId, required: true},
    comments: [Comment]
});

module.exports = {
    men: model('men_comments', Rating),
    women: model('women_comments', Rating)
}
