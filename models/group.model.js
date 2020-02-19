/** Group Mongo DB model	*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const group = new Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    groupName: {
        type: String,
    },
    item: [{
        itemName: {
            type: String,
            require: true
        },
        itemPrice: {
            type: Number,
            require: true
        },
        itemGender: {
            type: String,
            require: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }],
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

module.exports = mongoose.model('group', group, 'group');