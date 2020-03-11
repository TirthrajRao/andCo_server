/** User Mongo DB model	*/
const mongoose = require("mongoose");

const User = new mongoose.Schema({
	firstName: {
		type: String,
	},
	lastName: {
		type: String,
	},
	password: {
		type: String,
	},
	mobile: {
		type: String
	},
	email: {
		type: String,
	},
	socialId: {
		type: String,
	},
	passwordVerification: {
		type: String,
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	emailVarification: {
		type: String,
	},
	isDeleted: {
		type: Boolean,
		default: false,
	},
	userRole: {
		type: String,
		default: 'user',
		enum: ['user', 'admin', 'subadmin'],
	},
	bankAccount: {
		accountNumber: {
			type: Number,
		},
		bankName: {
			type: String,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	cardAccount: {
		cardNumber: {
			type: Number
		},
		cvv: {
			type: Number
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	address: {
		deliverName: {
			type: String
		},
		phoneNo: {
			type: Number
		},
		email: {
			type: String
		},
		address: {
			type: String
		},
		deliverDays: {
			type: String
		},
		timePeriod: {
			type: String
		},
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'event'
		}
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

module.exports = mongoose.model("User", User);
