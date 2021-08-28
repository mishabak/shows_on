var db = require('../config/connection')
var collection = require('../config/collection')
require('dotenv').config()
const accountSid = process.env.twilio_AccountSid
const authToken = process.env.twilio_AuthToken
const client = require('twilio')(accountSid, authToken);


module.exports = {
    // for signup theater owner
    sendMessage: (phone) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verifications
                .create({ to: phone, channel: 'sms' })
                .then(verification => resolve())
                .catch(verification => reject())


        })
    },

    compareOtp: (result) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verificationChecks
                .create({ to: result.Phone, code: result.Otp })
                .then((data) => {
                    console.log(data.status);
                    if (data.status == 'approved') {
                        resolve()
                    } else {
                        reject()
                    }

                }).catch(() => {
                    reject()
                })
        })
    },
    // for login theater owner
    sendMesssageTheaterLogin: (phone) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verifications
                .create({ to: phone, channel: 'sms' })
                .then(verification => resolve())
                .catch(verification => reject())


        })
    },

    compareOtpTheaterLogin: (result) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verificationChecks
                .create({ to: result.Phone, code: result.Otp })
                .then((data) => {
                    console.log(data.status);
                    if (data.status == 'approved') {
                        resolve()
                    } else {
                        reject()
                    }

                }).catch(() => {
                    reject()
                })
        })
    },

    // for signup user 
    sendMesssageUserSignup: (phone) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verifications
                .create({ to: phone, channel: 'sms' })
                .then(verification => resolve())
                .catch(verification => reject())
        })
    },

    compareOtpUserSignUp: (result) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verificationChecks
                .create({ to: result.Phone, code: result.Otp })
                .then((data) => {
                    console.log(data.status);
                    if (data.status == 'approved') {
                        resolve()
                    } else {
                        reject()
                    }
                }).catch(() => {
                    reject()
                })
        })
    },

     // for Otp login user 
     sendMesssageUserlogin: (phone) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verifications
                .create({ to: phone, channel: 'sms' })
                .then(verification => resolve())
                .catch(verification => reject())
        })
    },

    compareOtpUserLogin: (result) => {
        return new Promise(async (resolve, reject) => {
            await client.verify.services(process.env.twilio_ServiceId)
                .verificationChecks
                .create({ to: result.Phone, code: result.Otp })
                .then((data) => {
                    console.log(data.status);
                    if (data.status == 'approved') {
                        resolve()
                    } else {
                        reject()
                    }
                }).catch(() => {
                    reject()
                })
        })
    }


}