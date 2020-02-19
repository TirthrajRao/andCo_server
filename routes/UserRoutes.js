const express = require("express");

const router = express.Router();

// Controllers          
const UserController = require("../controller/User.Controller");

// Middleware
const ensureAuthenticated = require('../middleware/ApiAuth');

// Validations
const userValidation = require("../validations/UserValidations");


// Signup Related API

router.post('/signup', userValidation.signUp, UserController.signUp);
router.put('/mailSend', UserController.mailSendToUser);
router.put('/email-verify', userValidation.emailVerification, UserController.emailVerification);
router.put('/resendVerification', UserController.resendVerification);

// Password Related API

router.post('/changepassword', ensureAuthenticated.validateToken, userValidation.changePassword, UserController.changePassword);
router.post('/forgotpassword', userValidation.forgotPassword, UserController.forgotPassword);
router.post('/reset-password/:hashcode', userValidation.updatedPassword, UserController.updatedPassword);

// Social Login API

router.post('/login', userValidation.login, UserController.login);
router.post('/login/google', userValidation.googleLogin, UserController.googleLogin);
router.post('/login/facebook', userValidation.facebookLogin, UserController.facebookLogin);
router.post('/login/outlook', userValidation.outLookLogin, UserController.outLookLogin);
router.post('/login/yahoo', UserController.yahooLogin);

// Bank Account Related API

router.put('/account', ensureAuthenticated.validateToken, userValidation.addBankAccountDetail, UserController.addBankAccountDetail);
router.get('/accountList', ensureAuthenticated.validateToken, UserController.getAccountDetailList);

// Adminside Related API

router.get('/user/user-list', ensureAuthenticated.validateToken, UserController.totalUserList);
router.post('/sub-admin', ensureAuthenticated.validateToken, UserController.addSubAdmin);

module.exports = router;


