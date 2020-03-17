/** Events Mongo DB model	*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const event = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	eventTitle: {
		type: String,
	},
	guest: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	eventType: {
		type: String,
	},
	paymentDeadlineDate: {
		type: Date
	},
	payMentTransferDate: {
		type: String
	},
	paymentDeadlineTime: {
		type: String
	},
	hashTag: {
		type: String
	},
	isPublic: {
		type: Boolean,
		default: true
	},
	profilePhoto: {
		type: String
	},
	isLogistics: {
		type: Boolean
	},
	eventTheme: {
		type: String
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
	defaultImage: {
		type: String
	},
	eventLink: {
		type: String,
	},
	activities: [{
		activityName: {
			type: String,
			require: true,
		},
		activityStartDate: {
			type: Date,
		},
		activityEndDate: {
			type: Date
		},
		createdAt: {
			type: Date,
			default: new Date(),
		},
		isDeleted: {
			type: Boolean,
			default: false
		}
	}],
	thanksMessage: {
		attachment: {
			type: String,
		},
		message: {
			type: String,
		},
	},
	bankDetails: {
		bankName: {
			type: String,
		},
		accountNumber: {
			type: Number,
		},
		cardNumber: {
			type: Number
		}
	},
	afterEventMessage: {
		message: {
			type: String
		},
		messageDate: {
			type: String
		},
		messagePreference: {
			type: String
		},
	},
	hearAbout: {
		type: String
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
module.exports = mongoose.model('event', event, 'event');
