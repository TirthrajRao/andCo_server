const bcrypt = require("bcrypt");
const request = require('request');
const jwt = require('jsonwebtoken');
const CryptoJS = require("crypto-js");

const key = 'andCo@testing'
// Database model
const UserModel = require("../models/user.model");

// Service Variable
const userService = require("../services/user.service");

// Constant Variable
const config = require("../configNew");

/**
 * Signup User API
 * @api {post} /api/signup 
 * @apiParamExample {json} Input
 * {
 *      "firstName" : "",
 *      "lastName" : "",
 *      "email" : "",
 *      "password" : "",
 *      "mobile" : "",
 * }
 */
 module.exports.signUp = (req, res) => {
 	const emailId = req.body.email
 	let password = req.body.password;

 	var bytes  = CryptoJS.AES.decrypt(password, key);
 	var originalText = bytes.toString(CryptoJS.enc.Utf8);


 	const newUser = {
		// email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		// mobile: req.body.mobile,
		password: bcrypt.hashSync(originalText, 10),
	}
	userService.signUp(emailId, newUser).then((newUserUpdate) => {
		console.log("new user update completed", newUserUpdate)
		return res.status(200).json({ message: newUserUpdate.message })
	}).catch((error) => {
		console.log("error while update user", error)
		return res.status(error.status).json({ message: error.message })
	})
	// UserModel.findOne({ email: req.body.email }, (error, user) => {
	// 	if (user == null) {
	// 		userService.signUp(newUser).then((response) => {
	// 			return res.status(200).json({ message: response.message, data: response.data });
	// 		}).catch((error) => {
	// 			console.log('error: ', error);
	// 			return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	// 		});
	// 	} else if (error) {
	// 		const errorResponse = {
	// 			status: false,
	// 			message: 'Internal server Error',
	// 		};
	// 		return res.status(500).send(errorResponse);
	// 	} else {
	// 		const successResponse = {
	// 			status: false,
	// 			message: 'User already registered please login.',
	// 		};
	// 		return res.status(400).send(successResponse);
	// 	}
	// });
}


module.exports.mailSendToUser = (req, res) => {
	console.log("body of mail", req.body)
	let details = {
		email: req.body.email
	}
	userService.mailSendToUser(details).then((mailSend) => {
		console.log("mail send to user for code", mailSend)
		return res.status(200).json({ message: mailSend.message })
	}).catch((error) => {
		console.log("error while send code mail to user", error)
		return res.status(error.status).json({ message: error.message })
	})

}



/**
 * Change Password API
 * @api {post} /api/changepassword 
 * @apiParamExample {json} Input
 * {
 *      "newPassword" : "",
 *      "currentPassword" : "",
 * }
 * @req.header = authorization
 */

 module.exports.changePassword = (req, res) => {
 	console.log("Req.User In Change Password", req.user);
 	const userData = {
 		newPassword: req.body.newPassword,
 		oldPassword: req.body.currentPassword,
 	}
 	let customerId = req.user.user._id;
 	userService.changePassword(customerId, userData).then((response) => {
 		return res.status(200).json({ message: response.message, status: 1 });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

/**
 * Forgot Password API
 * @api {post} /api/forgotpassword 
 * @apiParamExample {json} Input
 * {
 *      "email" : "",
 * }
 */
 module.exports.forgotPassword = (req, res) => {
 	const emailId = req.body.email;
 	userService.forgotPassword(emailId).then((response) => {
 		return res.status(200).json({ message: response.message, status: 1 });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

//Updated Password For Forgot Password Link Send To Email To User
module.exports.updatedPassword = (req, res) => {
	console.log("details of forgot password", req.body)
	const resetPasswordHash = req.params.hashcode;

	let password = req.body.newPassword;

 	var bytes  = CryptoJS.AES.decrypt(password, key);
 	var originalText = bytes.toString(CryptoJS.enc.Utf8);

	const newpassword = originalText;
	userService.updatedPassword(resetPasswordHash, newpassword).then((response) => {
		return res.status(200).json({ message: response.message, status: 1 });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

//Email Verification Function Verify the User Email After Signup Process
module.exports.emailVerification = (req, res) => {
	console.log("details of body", req.body)
	let originalText = {};
	let newCode = req.body.verificationNewCode;
	console.log("details of new user ", newCode)
	var bytes  = CryptoJS.AES.decrypt(newCode, key);
	// console.log("first part of crypto", bytes)
	originalText = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
	// newText = originalText;
	console.log("details of code verificaiton===========", originalText.verificationNewCode)
	const email = req.body.email;
	const emailVerificationCode = originalText.verificationNewCode;
	// console.log('Email and Verification Code===========', emailVerificationCode);
	userService.emailVerification(email, emailVerificationCode).then((response) => {
		return res.status(200).json({ message: response.message, status: 1, data: response.data });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}

/**
 * Local User Login API
 * @api {post} /api//login 
 * @apiParamExample {json} Input
 * {
 *      "email" : "",		
 * 		"password":"",
 * }
 */
 module.exports.login = (req, res) => {
 	console.log("Request body", req.body);
 	let password = req.body.password;
 	console.log(password)
 	var bytes  = CryptoJS.AES.decrypt(password, key);
 	var originalText = bytes.toString(CryptoJS.enc.Utf8);

 	console.log("password change",originalText)


 	const userData = {
 		email: req.body.email,
 		password: originalText,
 		eventId: req.body.eventId,
 	}
 	console.log("data to send in service", userData)
 	userService.login(userData).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data, status: true });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error', data: error.data });
 	});
 }


//Function For Total User List with Detail
module.exports.totalUserList = (req, res) => {
	userService.totalUserList().then((response) => {
		return res.status(200).json({ message: response.message, data: response.data });
	}).catch((error) => {
		console.error('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
	});
}
/**
 * Google User Login API
 * @api {post} /api/login/google 
 */
 module.exports.googleLogin = (req, res) => {
 	const accessToken = req.body.id_token;
	// console.log("details of login uuser token", accessToken)
	userService.googleLogin(accessToken).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data, status: true });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error', status: 0 });
	});
}

module.exports.yahooLogin = (req, res) => {
	const accessToken = req.body.accessToken;
	const userId = req.body.userId;
	userService.yahooLogin(accessToken, userId).then((response) => {
		return res.status(200).json({ message: response.message, data: response.data, status: true });
	}).catch((error) => {
		console.log('error: ', error);
		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error', status: 0 });
	});
}

/**
 * Facebook User Login API
 * @api {post} /api/login/facebook 
 */
 module.exports.facebookLogin = (req, res) => {
 	const accessToken = req.body.sFaceBookSecretId;
 	userService.facebookLogin(accessToken).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data, status: true });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error', status: 0 });
 	});
 }

 module.exports.outLookLogin = (req, res) => {
 	const accessToken = req.body.accessToken;
 	userService.outLookLogin(accessToken).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data, status: true });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error', status: 0 });
 	});
 }

 module.exports.addBankAccountDetail = (req, res) => {

 	console.log('Req.user', req.user);

 	const userId = req.user.user._id;
 	const bankAccount = {
 		accountNumber: req.body.accountNumber,
 		bankName: req.body.bankName,
 	}
 	console.log('UserId:', userId);
 	userService.addBankAccountDetail(userId, bankAccount).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

 module.exports.removeBankAccount = (req, res) => {
 	const userId = req.user.user._id;
 	const accountId = req.body.accountId;
 	console.log('UserId:', userId);
 	console.log('accountId:', accountId);
 	userService.removeBankAccount(userId, accountId).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

 module.exports.getAccountDetailList = (req, res) => {

 	console.log('UserId:', req.user);

 	const userId = req.user.user._id;
 	console.log('UserId:', userId);
 	userService.getAccountDetailList(userId).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

 module.exports.resendVerification = (req, res) => {
 	const email = req.body.email;
 	console.log('Email To Verify:', email);
 	userService.resendVerification(email).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }

 module.exports.addSubAdmin = (req, res) => {
 	const userId = req.body.userId;
 	console.log('Requested User', req.user);
 	console.log('User ID:', userId);
 	userService.addSubAdmin(email).then((response) => {
 		return res.status(200).json({ message: response.message, data: response.data });
 	}).catch((error) => {
 		console.log('error: ', error);
 		return res.status(error.status ? error.status : 500).json({ message: error.message ? error.message : 'Internal Server Error' });
 	});
 }



