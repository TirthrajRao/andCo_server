/** Events Mongo DB model	*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
platFormOf = ['WP', 'GM', 'FB', 'TX', 'GN']

const event = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	eventTitle: {
		type: String,
	},
	guest: [
		{
			_id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			platForm: {
				type: {
					enum: platFormOf
				}
			}
		},
	],
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
	// isPublic: {
	// 	type: Boolean,
	// 	default: true
	// },
	profilePhoto: {
		type: String
	},
	isLogistics: {
		type: String
	},
	regestery: {
		type: String
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
	thankyouMessage: {
		message: {
			type: String,
		},
	},
	welcomeMessage: {
		message: {
			type: String
		}
	},
	bankAccount: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	cardAccount: {
		_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	// bankDetails: {
	// 	bankName: {
	// 		type: String,
	// 	},
	// 	accountNumber: {
	// 		type: Number,
	// 	},
	// 	cardNumber: {
	// 		type: Number
	// 	}
	// },
	afterEventMessageDetails: {
		afterEventMessage: {
			type: String
		},
		messageDate: {
			type: Date,
			default: new Date()
		},
		listOfGuest: {
			type: String
		}
	},
	invitationMessage: {
		type: String
	},
	reminderDetails: {
		reminderMessage: {
			type: String
		},
		reminderStartDate: {
			type: String
		},
		reminderStartTime: {
			type: String
		},
		guestList: {
			type: String
		}
	},
	afterEventMessage: {

	},
	hearAbout: {
		aboutType: {
			type: String
		},
		message: {
			type: String
		},
		vendorMessage: {
			type: String
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
module.exports = mongoose.model('event', event, 'event');
