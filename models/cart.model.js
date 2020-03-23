/** Cart Mongo DB model	*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event'
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('cart', cart, 'cart');
