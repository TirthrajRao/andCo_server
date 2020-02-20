const jwt = require("jsonwebtoken");
// const config.env = require("./config/env.config");
const CYPHERKEY = 'asoebi'
/**
 * Function To Validation Of JWT Token
 * @param {authorization} - AccessToken
 * @returns {User} - Decoded User Detail
 */
 module.exports.validateToken = async (req, res, next) => {


 	console.log("important key ========",process.env.CYPHERKEY)
 	const { authorization } = req.headers;
 	console.log("ama su ave che",authorization )
 	new Promise(async (resolve, reject) => {
 		if (authorization && authorization !== "") {
 			console.log("first ama avu joye")
 			jwt.verify(authorization, CYPHERKEY, (err, decoded) => {
 				if (err) {
 					console.log("error while send authentication of user", err)
 					reject({ status: false, message: "Failed to authenticate token.", });
 				} else {
 					req.user = decoded;
 					resolve({ status: true, user: decoded, });
 				}
 			});
 		} else {
 			reject({ status: false, message: "You Need To Login First", });
 		}
 	}).then(({ status, message, user }) => {
 		req.user = (status) ? user : null;
 		(status) ? next() : res.status(200).json({ status, message, user });
 	}).catch(({ status, message }) => {
 		res.status(401).json({ status, message });
 	})
 };
