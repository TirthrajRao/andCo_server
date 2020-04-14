// Npm modules
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const request = require('request');

const siteName = 'andco'

// Database models 
const UserModel = require('../models/user.model');
const eventModel = require('../models/event.model')

// Static variables
const ObjectId = require('mongodb').ObjectId;
const config = require("../configNew");

// Services
const mailService = require('../services/mail.service');

/**
 * New User Signup Function
 * @param {object} - UserData Object For Signup
 * @returns {Promise} - Register User or reason why failed
 */
const signUp = (email, userData) => {
    console.log("user details========", userData)
    return new Promise((resolve, reject) => {
        UserModel.findOneAndUpdate({ email: email },
            { $set: userData }, { upsert: true, new: true }
        ).exec((error, userUpdate) => {
            if (error) console.log("error while update details of user", error)
            else {
                console.log("new user details", userUpdate)
                let data = {}
                data.firstName = userUpdate.firstName
                // data.lastName = userUpdate.lastName
                const defaultPasswordEmailoptions = {
                    to: userUpdate.email,
                    subject: `Welcome to andco`,
                    template: 'signUp'
                };
                mailService.mail(defaultPasswordEmailoptions, data, null, function (err, mailResult) {
                    if (err) {
                        console.log('error:', error);
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        console.log("created new user details", mailResult)
                        resolve({ data: userUpdate, message: 'User update completed' })
                        // resolve({ status: 200, message: 'Mail Send to login user for code.' })
                    }
                });
                // console.log("user detaoils update completed", userUpdate)
            }
        })
        // const emailVarification = Math.floor(100000 + Math.random() * 900000);
        // userData.emailVarification = emailVarification;
        // console.log("emailVarification code:", emailVarification);
        // UserModel.create(userData, (useerr, userres) => {
        //     if (useerr) {
        //         console.log('usererror: ', useerr);
        //         reject({ status: 500, message: 'Internal Server Error' });
        //     } else {
        //         userData.emailVarification = emailVarification;
        //         const defaultPasswordEmailoptions = {
        //             to: userData.email,
        //             subject: `Welcome to ${process.env.SITENAME} Confirm your email`,
        //             template: 'welcome'
        //         };
        //         mailService.mail(defaultPasswordEmailoptions, userData, null, function (err, mailResult) {
        //             if (err) {
        //                 console.log('error:', error);
        //                 reject({ status: 500, message: 'Internal Server Error' });
        //             } else {
        //                 const finalresponse = { email: userres.email, userId: userres._id }
        //                 resolve({ status: 200, message: 'You have Registered Successfully.Verification Code Send To Your Mail.', data: finalresponse })
        //             }
        //         });
        //     }
        // });
    });
}

/**
 * @param {emailId} data 
 * Mail send to login user for send code
 */
const mailSendToUser = (data) => {
    console.log("email of login user", data)
    return new Promise((resolve, reject) => {
        UserModel.findOne({ email: data.email })
            .exec((error, userFind) => {
                if (error) console.log("error while get user name", error)
                else {
                    console.log("user is found or not", userFind)
                    if (userFind == null) {
                        const emailVarification = Math.floor(100000 + Math.random() * 900000);
                        data.emailVarification = emailVarification;
                        UserModel.create(data, (useerr, userres) => {
                            if (useerr) {
                                console.log('usererror: ', useerr);
                                reject({ status: 500, message: 'Internal Server Error' });
                            } else {
                                data.emailVarification = emailVarification;
                                const defaultPasswordEmailoptions = {
                                    to: data.email,
                                    subject: `Welcome to ${siteName} Confirm your email`,
                                    template: 'welcome'
                                };
                                mailService.mail(defaultPasswordEmailoptions, data, null, function (err, mailResult) {
                                    if (err) {
                                        console.log('error:', error);
                                        // reject({ status: 500, message: 'Internal Server Error' });
                                    } else {
                                        console.log("created new user details", userres)
                                        // const finalresponse = { email: userres.email, userId: userres._id }
                                        resolve({ status: 200, message: 'Please check your email for code ' })
                                    }
                                });
                            }
                        });
                    } else {
                        reject({ status: 409, message: 'User already exits' })
                    }
                }
            })
    })
}

/**
 *Function For Email Verification Of Local User
 * @param {emailVerificationCode} - email verificationCode for Verification
 * @returns {Promise} - Email Verification or reason why failed
 */
const emailVerification = (email, emailVerificationCode) => {
    console.log("details of new user", email, emailVerificationCode)
    return new Promise((resolve, reject) => {
        UserModel.findOneAndUpdate({ email: email, emailVarification: emailVerificationCode }, { $set: { isVerified: true, emailVarification: '' } }).exec((err, userres) => {
            console.log("user is find or not", userres)
            if (err) {
                console.log("Error:", err);
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (!userres) {
                console.log('Invalid Varification Code');
                reject({ status: 500, message: 'Invalid Varification Code' });
            }
            else {
                console.log("ama avu joye=================")
                const finalresponse = { email: userres.email, userId: userres._id }
                resolve({ status: 200, message: 'Email Verified successfully.', data: finalresponse })
            }
        });
    });
}


/**
 * Check User Is Verified Or Not
 * @param {String} userId 
 * @returns {Promise}-Return True Or False As Per Condition
 */
const checkVerifiedOrNot = (userId) => {
    return new Promise((resolve, reject) => {
        // console.log('Email to Check For', email);
        const query = { _id: userId, isVerified: true };
        UserModel.findOne(query).exec((userErr, userRes) => {
            if (userErr) {
                console.log('User Error:', userErr);
                reject({ status: 500, message: 'Internal Sever Error' });
            } else if (userRes) {
                console.log('User Is Verified');
                resolve(true);
            } else {
                console.log('User Is Not Verified ');
                resolve(false);
            }
        });
    });
}

/** 
 * Login Function For Local User    
 * @param {object} - UserEmail Or UserPassword For Login
 * @returns {Promise} - JWT AccessToken or reason why failed
 */
const login = (body) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ email: body.email }).exec((err, user) => {
            if (err) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (user) {
                console.log('user:', user);
                if (bcrypt.compareSync(body.password, user.password)) {
                    if (user.isVerified) {
                        const payload = { user };
                        var token = jwt.sign(payload, config.jwtSecret);
                        loginUserEvent(user._id).then((userEvents) => {
                            console.log("user have event or not", userEvents)
                            checkTotalEvent(user._id).then((totalEventList) => {
                                console.log("total events of user", totalEventList)
                                const tokenData = { accessToken: token, UserRole: user.userRole, firstName: user.firstName, lastName: user.lastName, eventId: userEvents.status, totalEvent: totalEventList }
                                resolve({ status: 200, message: 'Login Successfully', data: tokenData });
                            }).catch((error) => {
                                console.log("error while get total events", error)
                            })
                        }).catch((error) => {
                            console.log("find to user event", error)
                        })
                    } else {
                        const data = { useremail: user.email, isVerified: false }
                        reject({ status: 400, message: 'User is Not Verified', data: data });
                    }
                } else {
                    reject({ status: 400, message: 'Your Password Is Invalid' });
                }
            } else {
                reject({ status: 400, message: 'This Email Is Not Registered Please Signup' });
            }
        });
    });
}



const checkTotalEvent = (userId) => {
    return new Promise((resolve, reject) => {
        eventModel.aggregate([
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                { 'userId': ObjectId(userId) },
                                { 'isDeleted': false },
                            ]
                        },
                        {
                            $and: [
                                { 'guest._id': ObjectId(userId) },
                                { 'isDeleted': false },
                            ]
                        },
                    ]
                }
            },
        ]).exec((error, totalEvents) => {
            if (error)
                //  console.log("error while get details of login user", error)
                reject({ status: 500, message: 'Error while no event found' })
            else
                //  console.log("total list of event", totalEvents.length)
                resolve(totalEvents.length)
        })
    })
}


const loginUserEvent = (userId) => {
    console.log("login user id", userId)
    return new Promise((resolve, reject) => {
        eventModel.findOne({ userId: ObjectId(userId) })
            .exec((error, eventOfUser) => {
                if (error)
                    console.log("error while get event of user", error)
                // reject({ status: 500, message: 'Error while get event list' })
                else {
                    console.log("user event list", eventOfUser)
                    if (eventOfUser) {
                        resolve({ status: 'true' })
                    }
                    resolve({ status: 'false' })
                }
            })
    })
}



/**
 *Get Profile Function Form JWT Token Send In Request Header
 * @param {authorization} - JWT AccessToken
 * @returns {Promise} - Decoded UserDetail or reason why failed
 */
const getProfile = (authorization) => {
    return new Promise((resolve, reject) => {
        jwt.verify(authorization, config.jwtSecret, function (err, decoded) {
            if (err) throw err;
            console.log("Decoded detail", decoded);
            const userId = decoded.customer._id;
            UserModel.aggregate([
                {
                    $match: { '_id': ObjectId(userId) }
                },
                {
                    $project: {
                        id: '$_id',
                        email: '$email',
                        firstName: '$first_name',
                        lastName: '$last_name',
                    }
                }
            ]).exec(function (error, userDetail) {
                if (error) {
                    reject(error);
                } else {
                    resolve({ status: 200, message: 'Successfully Get the Profile..!', data: userDetail[0] });
                }
            });
        });
    });
}

/**
 * Function For Change Password of Local User
 * @param {String} userId 
 * @param {Object} userData 
 */
const changePassword = (userId, userData) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ _id: userId }).exec((err, user) => {
            if (err) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (user) {
                if (bcrypt.compareSync(userData.oldPassword, user.password)) {
                    user.password = bcrypt.hashSync(userData.newPassword, 10);
                    user.save();
                    resolve({ status: 200, message: 'Your password has been changed Successfully', data: user })
                } else {
                    reject({ status: 500, message: 'password does not match' });
                }
            } else {
                return res.status(400).send({ errMsg: 'Bad request' });
            }
        });
    });
}

/**
 *Function For Forgot Password Link Send To Register Email
 * @param {email} - EmailId To Send Email
 * @returns {Promise} - ForgotPassword Link send in email or reason why failed
 */
const forgotPassword = (email) => {
    return new Promise((resolve, reject) => {
        const resetPasswordHash = randomstring.generate();
        console.log("Hashed Password:", resetPasswordHash);
        UserModel.findOne({ email: email }).exec((err, user) => {
            if (err) {
                reject({ status: 500, message: 'Internal Server Error' });
            } else if (user) {
                user.passwordVerification = resetPasswordHash;
                user.save();

                user.verificationUrl = config.baseUrl + config.forgotPasswordLink + resetPasswordHash;
                var defaultPasswordEmailoptions = {
                    to: email,
                    subject: 'here the link to reset your password',
                    template: 'forgot-password'
                };

                mailService.mail(defaultPasswordEmailoptions, user, null, function (err, mailResult) {
                    if (err) {
                        reject({ status: 500, message: 'Internal Server Error' });
                    } else {
                        resolve({ status: 200, message: 'ResetPassword Link Send in Email' });
                    }
                });
            }
        });
    });
}

/**
 *Password Updated Using Forgotpassword Link Send To Email Id
 * @param {passwordhash,newPassword} - passwordhash and new password
 * @returns {Promise} - ChangePassword or reason why failed
 */
const updatedPassword = (resetPasswordHash, newpassword) => {
    console.log("details of login user with hash and password", resetPasswordHash, newpassword)
    return new Promise((resolve, reject) => {
        UserModel.findOne({ passwordVerification: resetPasswordHash }).exec((err, user) => {
            if (err) {
                console.log("Error:", err);
                reject({ status: 500, message: 'Invalid Resetpassword link' });
            } else {
                console.log("user password details", user)
                user.password = bcrypt.hashSync(newpassword, 10);
                user.passwordVerification = '';
                user.save();
                resolve({ status: 200, message: 'Your password changed successfully', data: user })
            }
        });
    });
}

/**
 * List Of All Registered User
 * @returns {Promise} - User List or reason why failed
 */
const totalUserList = () => {
    return new Promise((resolve, reject) => {
        UserModel.aggregate([
            {
                $match: {
                    $and: [
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    firstName: '$firstName',
                    lastName: '$lastName',
                    email: '$email',
                    mobile: '$mobile'
                }
            },
        ]).exec(function (userListError, userList) {
            if (userListError) {
                reject(userListError);
            } else {
                resolve({ status: 200, message: 'Total User List!', data: userList });
            }
        });
    });
}

/**
 * Yahoo Login Function For Decoding AccessToken
 * @param {String} accessToken 
 * @param {String} userId 
 * @returns {Promise} Decoded User Jwt Token
 */
const yahooLogin = (accessToken, userId) => {
    return new Promise((resolve, reject) => {
        yahooAuthentication(accessToken, userId).then((response) => {
            console.log("Response", response);
            UserModel.findOne({ email: response.email }).exec((err, user) => {
                if (err) {
                    reject({ status: 500, message: 'Internal Server Error' });
                } else if (user) {
                    const payload = { user };
                    var token = jwt.sign(payload, config.jwtSecret);
                    const tokenData = { accessToken: token, UserRole: user.userRole, firstName: user.firstName, lastName: user.lastName }

                    resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                } else {
                    UserModel.create(response, (useerr, userres) => {
                        if (useerr) {
                            console.log('usererror: ', useerr);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                            const payload = { userres };
                            var token = jwt.sign(payload, config.jwtSecret);
                            const tokenData = { accessToken: token, UserRole: userres.userRole, firstName: userres.firstName, lastName: userres.lastName }
                            resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                        }
                    })
                }
            })
        }).catch((error) => {
            reject({ status: 500, message: 'Internal Sever Error' });
        });
    });
}

/**
 * Yahoo Authentication For Decoding AccessToken
 * @param {String} accessToken 
 * @param {String} userId 
 * @returns {Promise} Decode User Details
 */
function yahooAuthentication(accessToken, userId) {
    return new Promise((resolve, reject) => {
        const options = {
            url: config.yahooUrl + userId + '/profile?format=json',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        };
        console.log("API Url For OutLook", options.url);
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
                console.log(err);
            } else if (body) {
                let json = JSON.parse(body);
                const profile = json.profile;
                const newUser = {
                    firstName: profile.givenName,
                    lastName: profile.familyName,
                    email: profile.emails[0].handle,
                    socialId: profile.guid,
                    mobile: profile.phones[0].number
                }
                resolve(newUser);
            }
        });
    });
}

/**
 * Function For Microsoft Authentication Using AccessToken
 * @param {String} accessToken 
 * @returns {Promise} Decoded User Jwt Token
 */
const outLookLogin = (accessToken) => {
    return new Promise((resolve, reject) => {
        outLookAuthentication(accessToken).then((response) => {
            console.log("Response", response);
            UserModel.findOne({ email: response.email }).exec((err, user) => {
                if (err) {
                    reject({ status: 500, message: 'Internal Server Error' });
                } else if (user) {
                    const payload = { user };
                    var token = jwt.sign(payload, config.jwtSecret);
                    const tokenData = { accessToken: token, UserRole: user.userRole, firstName: user.firstName, lastName: user.lastName }
                    resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                } else {
                    UserModel.create(response, (useerr, userres) => {
                        if (useerr) {
                            console.log('usererror: ', useerr);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                            const payload = { userres };
                            var token = jwt.sign(payload, config.jwtSecret);
                            const tokenData = { accessToken: token, UserRole: userres.userRole, firstName: userres.firstName, lastName: userres.lastName }
                            resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                        }
                    })
                }
            })
        }).catch((error) => {
            reject({ status: 500, message: 'Internal Sever Error' });
        });
    });
}

/**
 * Microsoft Authentication Function For Decoding AccessToken
 * @param {String} accessToken 
 * @param {String} userId 
 * @returns {Promise} Decoded User Detail
 */
function outLookAuthentication(accessToken, userId) {
    return new Promise((resolve, reject) => {
        const options = {
            url: config.outLookUrl,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        };
        console.log("API Url For Yahoo", options.url);
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
                console.log(err);
            } else if (body) {
                const profile = JSON.parse(body);
                const newUser = {
                    firstName: profile.surname,
                    lastName: profile.familyName,
                    email: profile.userPrincipalName,
                    socialId: profile.id,
                }
                resolve(newUser);
            }
        });
    });
}

/**
 * Google Authentication Function For Decoding AccessToken
 * @param {String} accessToken 
 * @returns {Promise} Return JWT Decoded Token
 */
const googleLogin = (accessToken) => {
    return new Promise((resolve, reject) => {
        googleAuthentication(accessToken).then((response) => {
            console.log("Response of google token", response);
            UserModel.findOne({ email: response.email }).exec((err, user) => {
                if (err) {
                    reject({ status: 500, message: 'Internal Server Error' });
                } else if (user) {
                    const payload = { user };
                    var token = jwt.sign(payload, config.jwtSecret);
                    const tokenData = { accessToken: token, UserRole: user.userRole, firstName: user.firstName, lastName: user.lastName }

                    resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                } else {
                    UserModel.create(response, (useerr, userres) => {
                        if (useerr) {
                            console.log('usererror: ', useerr);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                            const payload = { userres };
                            var token = jwt.sign(payload, config.jwtSecret);
                            const tokenData = { accessToken: token, UserRole: userres.userRole, firstName: userres.firstName, lastName: userres.lastName }
                            resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                        }
                    })
                }
            })
        }).catch((error) => {
            console.log("error while get details of user", error)
            reject({ status: 500, message: 'Internal Sever Error' });
        });
    });
}

/**
 * Google Authentication Function For Decoding AccessToken
 * @param {string} accessToken 
 * @returns {Promise} Decode User Details
 */
function googleAuthentication(accessToken) {
    return new Promise((resolve, reject) => {
        let url = config.googleUrl + accessToken;
        console.log('API Url For Google', url);
        request.get(url, (err, response) => {
            // console.log("user response from google", response)
            if (config.googleClientId === JSON.parse(response.body).aud) {
                const profile = JSON.parse(response.body);
                const newUser = {
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                    email: profile.email,
                    socialId: profile.sub
                }
                console.log("new user details===========", newUser)
                resolve(newUser);
            } else {
                console.log("error while get details of uuser", err)
                reject(err)
            }
        });
    });
}

/**
 * Facebook Authentication Function For Decoding AccessToken
 * @param {String} accessToken 
 */
const facebookLogin = (accessToken) => {
    return new Promise((resolve, reject) => {
        facebookAuthentication(accessToken).then((response) => {
            console.log("Response", response);
            UserModel.findOne({ socialId: response.socialId }).exec((err, user) => {
                if (err) {
                    reject({ status: 500, message: 'Internal Server Error' });
                } else if (user) {
                    console.log("user mde che ke nai", user)
                    const payload = { user };
                    var token = jwt.sign(payload, config.jwtSecret);
                    const tokenData = { accessToken: token, UserRole: user.userRole, firstName: user.firstName, lastName: user.lastName }
                    resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                } else {
                    console.log("jo user na mde to ama jay")
                    UserModel.create(response, (useerr, userres) => {
                        if (useerr) {
                            console.log('usererror: ', useerr);
                            res.status(500).json({ message: 'Internal Server Error' });
                        } else {
                            console.log("new user created ", userres)
                            const payload = { userres };
                            var token = jwt.sign(payload, config.jwtSecret);
                            const tokenData = { accessToken: token, UserRole: userres.userRole, firstName: userres.firstName, lastName: userres.lastName }
                            resolve({ status: 200, message: 'Login Successfully', data: tokenData })
                        }
                    });
                }
            })
        }).catch((error) => {
            reject({ status: 500, message: 'Internal Sever Error' });
        });
    });
}

/**
 * Facebook Authentication Function For Decoding AccessToken
 * @param {String} accessToken 
 */
function facebookAuthentication(accessToken) {
    return new Promise((resolve, reject) => {
        let url = config.fbUrl + '?access_token=' + accessToken + '&debug=all&fields=id,name,birthday,first_name,last_name,locale,gender,email&format=json&method=get&pretty=1&suppress_http_code=1';
        console.log('API Url For Facebook', url);
        request.get(url, (err, response) => {
            if (JSON.parse(response.body).error) {
                reject(err)
            } else {
                // console.log("response of facebook", response)
                const profile = JSON.parse(response.body)
                console.log("profile", profile);
                const newUser = {
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    email: profile.email,
                    socialId: profile.id,
                }
                resolve(newUser)
            };
        })
    })
}

/**
 * Add Bank Account Detail Using Specific UserId
 * @param {String} userId 
 * @param {Object} accountData 
 */
const addBankAccountDetail = (userId, accountData) => {
    return new Promise((resolve, reject) => {
        console.log('UserId In Service', userId);
        console.log('account Detail In Service', accountData);
        UserModel.findOneAndUpdate({ _id: userId }, { $push: { bankAccount: accountData } }, { upsert: true, new: true }).exec((err, response) => {
            if (err) {
                console.log('Error in account Details', err);
                reject({ status: 500, message: 'Internal Server Error', data: err });
            } else {
                console.log('Success Response', response);
                resolve({ status: 200, message: 'Account Detail Added Successfully.' });
            }
        });
    });
}

/**
 * Remove Bank Account Using AccountId
 * @param {String} accountId
 * @returns {Promise} Deleted Account Details 
 */
const removeBankAccount = (accountId) => {
    return new Promise((resolve, reject) => {
        console.log('account Id', accountId);
        UserModel.findByIdAndUpdate({ 'bankAccount._id': accountId }, { $set: { isDeleted: true } }, { upsert: true }).exec((err, response) => {
            if (err) {
                console.log('Error in Account Delete', err);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log('Updated Response:', response);
                resolve({ status: 200, message: 'Account Detail Removed Successfully.' });
            }
        });
    });
}

/**
 * Get Bank Account Details Of User Using UserId
 * @param {String} userId 
 * @param {Promise} AccountDetails 
 */
const getAccountDetailList = (userId) => {
    return new Promise((resolve, reject) => {
        console.log('UserId', userId);
        UserModel.aggregate([
            {
                $match: {
                    $and: [
                        { '_id': ObjectId(userId) },
                        { 'isDeleted': false },
                    ]
                }
            },
            {
                $project: {
                    bankDetail: {
                        $filter: {
                            input: "$bankAccount",
                            as: "bankDetail",
                            cond: { $eq: ["$$bankDetail.isDeleted", false] }
                        }
                    },
                    cardDetails: {
                        $filter: {
                            input: "$cardAccount",
                            as: "cardDetails",
                            cond: { $eq: ["$$cardDetails.isDeleted", false] }
                        }
                    }
                }
            }
        ]).exec(function (accErr, accList) {
            if (accErr) {
                console.log("what is error ", accErr)
                // reject({ status: 500, message: 'Internal Server Error' });
            } else {
                console.log('accList:', accList);
                resolve({ status: 200, message: 'Successfully Get the Bank Detail List.', data: accList[0] });
            }
        });
    });
}

/**
 * New User Signup Function
 * @param {object} - UserData Object For Signup
 * @returns {Promise} - Register User or reason why failed
 */
const resendVerification = (email) => {
    return new Promise((resolve, reject) => {
        console.log('Email To Verify:', email);
        const emailVarification = Math.floor(100000 + Math.random() * 900000);
        console.log("emailVarification code:", emailVarification);
        UserModel.findOneAndUpdate({ email: email }, { $set: { emailVarification: emailVarification } }, { upsert: true }).exec((userErr, userData) => {
            if (userErr) {
                console.log('usererror: ', userErr);
                reject({ status: 500, message: 'Internal Server Error' });
            } else {
                emailService.sendWelcomeEmail(userData.email, userData.firstName, emailVarification).then((response) => {
                    resolve({ status: 200, message: 'Email Verification Code Send to Your mail.', data: userres })
                }).catch((error) => {
                    console.log('error:', error);
                    reject({ status: 500, message: 'Internal Server Error' });
                });
            }
        });
    });
}



function enterDeliveryAddress(details, userId) {
    console.log("details of address", details, userId)
    return new Promise((resolve, reject) => {
        UserModel.findByIdAndUpdate({ _id: userId }, { $set: { address: details } }, { upsert: true, new: true })
            .exec((error, addressAdded) => {
                if (error)
                    //  console.log("error while add address", error)
                    reject({ status: 500, message: 'Error while enter address' })
                else {
                    resolve({ message: 'Address placed successfully' })
                    console.log("address added completed", addressAdded)
                }
            })
    })
}


function getAddressDetails(userId) {
    console.log("userid", userId)
    return new Promise((resolve, reject) => {
        UserModel.findOne({ _id: ObjectId(userId) })
            // .populate('address')
            .exec((error, addressFind) => {
                if (error)
                    //  console.log("erorr while get address", error)
                    reject({ status: 500, message: 'Error while get details of address' })
                else {
                    let sendData = addressFind.address
                    resolve({ sendData })
                    console.log("details of address", addressFind)
                }
            })
    })
}


function getAddressDetails(data, userId, finalFlage) {
    console.log("details of account", data, finalFlage)
    return new Promise((resolve, reject) => {
        if (finalFlage == false) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $set: { bankAccount: data } }, { upsert: true, new: true })
                .exec((error, accountAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add bank details' })
                    else {
                        resolve({ message: 'Bank account added' })
                        console.log("get details of account", accountAdded)
                    }
                })
        }
        if (finalFlage == true) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $set: { cardAccount: data } }, { upsert: true, new: true })
                .exec((error, cardAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add card details' })
                    else {
                        // console.log("get details of account", cardAdded)
                        resolve({ message: 'Card Details added' })
                    }
                })
        }
    })
}
function addAccountDetails(data, userId, finalFlage) {
    console.log("details of account", data, finalFlage)
    return new Promise((resolve, reject) => {
        if (finalFlage == false) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $push: { bankAccount: data } }, { upsert: true, new: true })
                .exec((error, accountAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add bank details' })
                    else {
                        resolve({ message: 'Bank account added' })
                        console.log("get details of account", accountAdded)
                    }
                })
        }
        if (finalFlage == true) {
            UserModel.findByIdAndUpdate({ _id: userId }, { $push: { cardAccount: data } }, { upsert: true, new: true })
                .exec((error, cardAdded) => {
                    if (error)
                        //  console.log("error while add account", error)
                        reject({ status: 500, message: 'Error while add card details' })
                    else {
                        // console.log("get details of account", cardAdded)
                        resolve({ message: 'Card Details added' })
                    }
                })
        }
    })
}




module.exports.addAccountDetails = addAccountDetails
module.exports.getAddressDetails = getAddressDetails
module.exports.enterDeliveryAddress = enterDeliveryAddress
module.exports.login = login;
module.exports.signUp = signUp;
module.exports.mailSendToUser = mailSendToUser
module.exports.getProfile = getProfile;
module.exports.yahooLogin = yahooLogin;
module.exports.googleLogin = googleLogin;
module.exports.outLookLogin = outLookLogin;
module.exports.facebookLogin = facebookLogin;
module.exports.totalUserList = totalUserList;
module.exports.changePassword = changePassword;
module.exports.forgotPassword = forgotPassword;
module.exports.updatedPassword = updatedPassword;
module.exports.removeBankAccount = removeBankAccount;
module.exports.emailVerification = emailVerification;
module.exports.resendVerification = resendVerification;
module.exports.checkVerifiedOrNot = checkVerifiedOrNot;
module.exports.getAccountDetailList = getAccountDetailList;
module.exports.addBankAccountDetail = addBankAccountDetail;


