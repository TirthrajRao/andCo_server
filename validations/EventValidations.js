const Joi = require('joi');

const validNumber = Joi.number();
const validString = Joi.string();
const validBoolean = Joi.boolean();
const validArray = Joi.array();
const validAny = Joi.any();

const requiredBoolean = Joi.boolean().required();
const requiredString = Joi.string().required();
const requiredDate = Joi.date().required();
const requiredNumber = Joi.number().required();

// New Event API Validation

module.exports.newEvent = (req, res, next) => {
	console.log("call this", req.body)
	const schema = Joi.object().keys({
		eventType: requiredString,
		eventTitle: requiredString,
		hashTag: requiredString,
		background: requiredString
		// deadlineDate: requiredDate,
		// isPublic: requiredBoolean,
		// isLogistics: requiredBoolean,
		// defaultImage: validAny,
	});
	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				console.log("what is errror", err)
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};

// New Activity Function Validation
module.exports.newActivity = (req, res, next) => {
	const schema = Joi.object().keys({
		activityName: requiredString,
		eventId: requiredString,
		activityStartDate: requiredDate,
		activityEndDate: requiredDate
	});
	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};

// New Group Function Validation

module.exports.newGroup = (req, res, next) => {

	const schema = Joi.object().keys({
		eventId: requiredString,
		group: validArray.items(group)
	});

	const group = Joi.object().keys({
		activityId: requiredString,
		groupName: requiredString,
		male: validArray.items(male),
		female: validArray.items(female),
	})

	const male = Joi.object().keys({
		itemName: requiredString,
		itemPrice: requiredNumber,
	});

	const female = Joi.object().keys({
		itemName: requiredString,
		itemPrice: requiredNumber,
	});

	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};

// Validation For Add Item Into Cart Function

module.exports.addItemToCart = (req, res, next) => {

	const item = Joi.object().keys({
		itemName: requiredString,
		itemPrice: requiredNumber,
	});

	const schema = Joi.object().keys({
		groupId: requiredString,
		eventId: requiredString,
		activityId: requiredString,
		item: item,
		gender: requiredString
	});

	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};

//Bank Detail Added To Event Function Validation

module.exports.addBankAccountDetailToEvent = (req, res, next) => {
	const schema = Joi.object().keys({
		eventId: requiredString,
		accountId: requiredString,
		paymentType: requiredString,
	});
	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};

// After Event Message To Event Function Validation
module.exports.afterEventMessageDetail = (req, res, next) => {
	const schema = Joi.object().keys({
		eventId: requiredString,
		messageDate: requiredDate,
		messagePreference: requiredString,
		message: requiredString,
	});
	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};


//Thanks Message To Event Function Validation

module.exports.thanksMessageDetail = (req, res, next) => {
	const schema = Joi.object().keys({
		eventId: requiredString,
		message: requiredString,
	});
	Joi.validate(
		req.body,
		schema,
		{ convert: true },
		(err, value) => {
			if (err) {
				return res.status(400).json({
					message: err.details[0] && err.details[0].message ? err.details[0].message : 'Bad request'
				});
			} else {
				next();
			}
		}
	);
};



