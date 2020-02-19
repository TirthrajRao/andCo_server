const Joi = require('joi');

const validNumber = Joi.number();
const validString = Joi.string();
const validBoolean = Joi.boolean();
const validArray = Joi.array();

const requiredBoolean = Joi.boolean().required();
const requiredString = Joi.string().required();
const requiredDate = Joi.date().required();
const requiredNumber = Joi.number().required();
const requiredEmail = Joi.string().trim().required().email();


// SignUp Validation Function

module.exports.signUp = (req, res, next) => {
	const schema = Joi.object().keys({
		email: Joi.string().required().email(),
		password: requiredString,
		firstName: requiredString,
		lastName: requiredString,
		// mobile: requiredNumber
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

// Login Validation Function

module.exports.login = (req, res, next) => {
	console.log("details of login user in validation", req.body)
	const schema = Joi.object().keys({
		email: Joi.string().trim().required().email(),
		password: Joi.string().trim().required(),
	});
	console.log("details if enter", schema.email)
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

// Change Password Validation Function

module.exports.changePassword = (req, res, next) => {
	const schema = Joi.object().keys({
		currentPassword: Joi.string().trim().required(),
		newPassword: Joi.string().trim().required(),
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

// Validation Function For Forgot Password

module.exports.forgotPassword = (req, res, next) => {
	const schema = Joi.object().keys({
		email: Joi.string().trim().required().email(),
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

// Validation Function For Updated Password

module.exports.updatedPassword = (req, res, next) => {
	const schema = Joi.object().keys({
		newPassword: validString,
		confirmPassword: validString,
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

// Validation Function For Add Profile Detail  

module.exports.addProfileDetail = (req, res, next) => {

	const details = Joi.object().keys({
		firstName: requiredString.label('First name is required.'),
		lastName: requiredString.label('Last name is required.'),
		mobile: requiredNumber.label('Mobile number is required'),
	});

	const schema = Joi.object().keys({
		userId: requiredString,
		details: details
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

// Validation Function For Email Verification

module.exports.emailVerification = (req, res, next) => {

	const schema = Joi.object().keys({
		email: requiredEmail,
		verificationNewCode: requiredString,
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

// Validation Function For User Bank Account Details

module.exports.addBankAccountDetail = (req, res, next) => {

	const schema = Joi.object().keys({
		accountNumber: requiredNumber.label('Account Number is required.'),
		bankName: requiredNumber.label('Bank name is required.'),
		IFSCCode: requiredString.label('IFSC Code is required.')
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

// Validation Function For User Bank Account Details

module.exports.addBankAccountDetail = (req, res, next) => {

	const schema = Joi.object().keys({
		accountNumber: requiredNumber.label('Account Number is required.'),
		bankName: requiredNumber.label('Bank name is required.'),
		IFSCCode: requiredString.label('IFSC Code is required.')
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

// Validation Function For Google Login

module.exports.googleLogin = (req, res, next) => {

	const schema = Joi.object().keys({
		id_token: requiredString.label('AccessToken Is Required.'),
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

// Validation Function For Facebook Login

module.exports.facebookLogin = (req, res, next) => {

	const schema = Joi.object().keys({
		sFaceBookSecretId: requiredString.label('AccessToken Is Required.'),
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

// Validation Function For OutLook Login

module.exports.outLookLogin = (req, res, next) => {

	const schema = Joi.object().keys({
		accessToken: requiredString.label('AccessToken Is Required.'),
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

// Validation Function For Yahoo Login

module.exports.yahooLogin = (req, res, next) => {

	const schema = Joi.object().keys({
		accessToken: requiredString.label('AccessToken Is Required.'),
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

module.exports.addBankAccountDetail = (req, res, next) => {
	const schema = Joi.object().keys({
		accountNumber: requiredString,
		bankName: requiredString
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






