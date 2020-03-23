/** Transaction Mongo DB model	*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transaction = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event'
    },
    item: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref:''
        },
        quantity: {
            type: Number
        },
    }],
    donation: {
        type: Number
    },
    finalTotal: {
        type: Number,
    },
    deliveryAddress: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    hasPaymentReceived: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    updatedAt: {
        type: Date,
        default: new Date(),
    },
});

module.exports = mongoose.model('transaction', transaction, 'transaction');
