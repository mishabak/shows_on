var express = require('express');
var router = express.Router();
var theaterHelpers = require('../helpers/theaterHelper')
var otpHelpers = require('../helpers/otpHelpers')
const theaterLoginHelper = (req, res, next) => {
  if (req.session.theaterStatus === true) {
    next()
  } else {
    res.redirect('/theater-management/email-login')
  }


}

/* GET theater_owner home page. */
router.get('/', theaterLoginHelper, function (req, res, next) {
  res.render('theater/dashboard', { theater_owner: true })
});

router.get('/sign-up', (req, res) => {
  res.render('theater/signup', {
    'theaterOwnerName': req.session.theaterOwnerName,
    'theaterName': req.session.theaterName,
    'theaterEmail': req.session.theaterEmail,
    'theaterPhone': req.session.theaterPhone,
    'invalidOtp': req.session.theaterInvalidOtp,
    'invalidCountryCode': req.session.theaterCountryCodeNumber,
    hidePartial: true,
    theater_owner: true
  })
  req.session.theaterOwnerName = null
  req.session.theaterName = null
  req.session.theaterEmail = null
  req.session.theaterPhone = null
  req.session.theaterInvalidOtp = false
  req.session.theaterCountryCodeNumber = false
})
router.post('/sign-up', (req, res) => {
  req.session.theatersignupDetails = req.body
  req.session.theaterPhoneNumber = req.body.Phone
  theaterHelpers.checkDetails(req.body).then(() => {
    otpHelpers.sendMessage(req.body.Phone).then(() => {
      res.render('theater/otp', { hidePartial: true, theater_owner: true })
    }).catch(() => {
      // invalid country code or phone number 
      req.session.theaterCountryCodeNumber = true
      res.redirect('/theater-management/sign-up')
    })
  }).catch((alreadyExist) => {
    req.session.theaterOwnerName = alreadyExist.theaterOwner
    req.session.theaterName = alreadyExist.theaterName
    req.session.theaterEmail = alreadyExist.email
    req.session.theaterPhone = alreadyExist.phone
    res.redirect('/theater-management/sign-up')
  })
})

router.post('/otp', (req, res) => {
  var data = {}
  data.Phone = req.session.theaterPhoneNumber
  data.Otp = req.body.Otp_verify
  otpHelpers.compareOtp(data).then(() => {
    theaterHelpers.addTheaterDetails(req.session.theatersignupDetails).then((response) => {
      req.session.theaterStatus = response.Status
      req.session.theaterDetails = response
      res.redirect('/theater-management/')

    })
  }).catch(() => {
    req.session.theaterInvalidOtp = true
    res.redirect('/theater-management/sign-up')
  })
})

router.get('/email-login', (req, res) => {
  res.render('theater/email-login', {
    theater_owner: true,
    hidePartial: true,
    'theaterLoginError': req.session.theaterLoginError,
  })
  req.session.theaterLoginError = false
})

router.post('/email-login', (req, res) => {
  theaterHelpers.theaterEmailLogin(req.body).then((response) => {
    req.session.theaterStatus = response.Status
    req.session.theaterDetails = response
    res.redirect('/theater-management')
  }).catch((response) => {
    console.log('error', response)
    req.session.theaterStatus = response
    req.session.theaterLoginError = true
    res.redirect('/theater-management')
  })

})


router.get('/otp-login', (req, res) => {
  res.render('theater/otp-login', {
    theater_owner: true,
    hidePartial: true,
    'theaterOwnerInvalidPhone': req.session.theaterOwnerInvalidPhone,
    'theaterOwnerinvalidOtp':req.session.theaterOwnerinvalidOtp
  })
  req.session.theaterOwnerInvalidPhone = false
  req.session.theaterOwnerinvalidOtp = false
})



router.post('/otp-login', (req, res) => {
  theaterHelpers.checktheaterPhoneNumber(req.body).then(() => {
    otpHelpers.sendMesssageTheaterLogin(req.body.Phone).then(() => {
      res.render('theater/otp-login-verify', {
        hidePartial: true,
        theater_owner: true,
        'theaterVerifyPhone': req.body.Phone
      })
    })
  }).catch(() => {
    req.session.theaterOwnerInvalidPhone = true
    res.redirect('/theater-management/otp-login')
  })
})

router.post('/otp-login-verify', (req, res) => {
  otpHelpers.compareOtpTheaterLogin(req.body).then(() => {
    theaterHelpers.theaterOtpLogin(req.body.Phone).then((response) => {
      req.session.theaterStatus = response.Status
      req.session.theaterDetails = response
      res.redirect('/theater-management/')
    }).catch((response)=>{
      req.session.theaterStatus = response
      res.redirect('/theater-management/')

    })
  }).catch(() => {
    req.session.theaterOwnerinvalidOtp = true
    redirect('/theater-management/otp-login')
  })
})


router.get('/logout', (req, res) => {
  req.session.theaterStatus = false
  res.redirect('/theater-management')
})

// router.get('/help',(req,res)=>{
//   res.render('theater/help')
// })
// var collection = require('../config/collection')
// var db = require('../config/connection')
// var bcrypt = require('bcrypt')
// var objectId = require('mongodb').ObjectId
// router.post('/help',async(req,res)=>{
//  req.body.Password = await bcrypt.hash(req.body.Password,10)


// var data = await db.get().collection(collection.THEATER_COLLECTION).insertOne(req.body)
// var daattaa = await db.get().collection(collection.THEATER_COLLECTION).findOne({_id:objectId('61061b94733c15738f937762')})
// console.log('dsafdadf',daattaa,data)
// })

module.exports = router;
