// Npm modules
const mailer = require('nodemailer');
const path = require('path');
const async = require("async");
// const config = require('.')
// Static variables
const compiler = require(path.join(__dirname, 'pug.service'));
const config = require('../config/env.config');

module.exports.mail = mail;
module.exports.verifyEmail = verifyEmail;

function verifyEmail(email, oldEmail, callback) {
    var to = addressparser(email);
    if (oldEmail) {
        console.log("oldEmail address is provided, trying to delete it as verified sender");

        sesService.deleteIdentity({ Identity: oldEmail }, function (err, data) {
            if (err) {
                console.error("Error while deleting old identity", err)
            } else {
                console.info("Old identity deleted");
            }
            return verify();
        })
    } else {
        verify();
    }
    function verify() {
        sesService.sendCustomVerificationEmail({
            EmailAddress: to[0].address,
            TemplateName: 'PrismaNoteVerifyEmail'
        }, function (err, data) {
            return callback(err, data);
        })
    }
}


/**
 * Send an mail using SMTP
 * @param {Object} options The options to send the mail like to, from and subject
 * @param {Object} data The data which is needed in the mail template <Optional>
 * @param {Array} attach Attachments <Optional>
 * @param {Function} callback Callback with error or result
 */
function mail(options, data, attach, callback) {


    const transporter = mailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'raoinfotechp@gmail.com',
            pass: 'raoinfotech@123',
        },
    });


    //Fill default options
    if (!options.from) {
        options.from = '"andCo"<no-reply@asoebi.com>';
    }

    if (!options.type) {
        options.type = null
    }

    if (options.priority) {
        var headers;
        if (options.priority == 'high') {
            headers = {
                "x-priority": "1",
                "x-msmail-priority": "High",
                "importance": "high"
            }
        } else if (options.priority == 'low') {
            headers = {
                "x-priority": "5",
                "x-msmail-priority": "low",
                "importance": "low"
            }
        }

    }
    function getHtml(options, callback) {
        if (options.emailTemplate == undefined || !options.emailTemplate) {
            //compile html template
            var templatePath = path.join(__dirname, '..', 'emailTemplate', options.template + '.pug');
            compiler(templatePath, data, function (err, html) {
                if (err) {
                    return callback(err);
                }
                return callback(null, html);
            })
        } else {
            return callback(null, options.emailTemplate);
        }
    }

    if (attach != null) {
        var attachments = [];

        async.eachSeries(attach, function (item, callback) {
            var attachment = {
                filename: item.filename,
                content: item.content,
                encoding: 'base64'
            }
            attachments.push(attachment);
            callback();
        }, function () {

        })
    }

    getHtml(options, function (err, html) {

        if (err) {
            console.log('Something went wrong while compiling file: ', err);
        } else {
            transporter.sendMail({
                from: options.from,
                to: options.to,
                bcc: options.bcc ? options.bcc : null,
                cc: options.cc ? options.cc : null,
                subject: options.subject,
                html: html,
                attachments: attachments ? attachments : null,
                headers: headers ? headers : null
            }, function (err, result) {
                if (err) {
                    console.error("Error while sending email", err)
                    if (err.name == 'MessageRejected') {
                        verifyEmail(options.from, null, function (err, verifyResult) {
                            console.error("Sender is not verified, requested for now but sender need to accept that")
                            if (typeof callback == 'function') {
                                return callback("NOT_VERIFIED", null);
                            }
                        })
                    } else {
                        if (typeof callback == 'function') {
                            return callback(err, null);
                        }
                    }
                } else {
                    console.log('sucess:', result);

                    if (typeof callback === 'function') {
                        return callback(null, data);
                    } else {
                        console.log('Inside Else----->>>:', result);
                        return callback(result);
                    }
                }
            })
        }
    })
}
