var express = require('express');
var router = express.Router();
var adminHelpers = require('../helpers/adminHelper')

const verifyLogin = (req, res, next) => {
  if (req.session.adminLoginError === false) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}


// view dashboard page
router.get('/',async function (req, res, next) {
 totalMovies =await adminHelpers.totalMovies()
 totalTheaters =  await adminHelpers.totalTheaters()
 totalUsers = await adminHelpers.totalUsers()
 totalBooking = await adminHelpers.totalBooking()
  res.render('admin/dashboard', { admin: true,totalMovies,totalTheaters,totalUsers ,totalBooking});
});

// view login page
router.get('/login', (req, res) => {
  res.render('admin/login', { admin: true, hide_partial: true, 'loginError': req.session.Error })
  req.session.Error = false
})

router.post('/login', async (req, res) => {
  await adminHelpers.adminLogin(req.body).then((response) => {
    req.session.admin = response
    req.session.adminLoginError = false
    res.redirect('/admin')
  }).catch(() => {
    req.session.adminLoginError = true
    req.session.Error = true
    res.redirect('/admin/login')
  })
})

router.get('/logout', (req, res) => {
  req.session.adminLoginError = true
  res.redirect('/admin')
})
router.get('/profile',(req,res)=>{
  res.render('admin/profile',{admin:true,'adminDetails':req.session.admin})
})
router.get('/user-management',async(req,res)=>{
 var userDetails = await  adminHelpers.findAllUsers()
  res.render('admin/user-management',{admin:true,'adminDetails':req.session.admin,userDetails})
})
router.get('/block-user/:userId',(req,res)=>{
  adminHelpers.blockUser(req.params.userId)
  res.redirect('/admin/user-management')
})
router.get('/unblock-user/:userId',(req,res)=>{
  adminHelpers.unBlockUser(req.params.userId)
  res.redirect('/admin/user-management')
})

router.get('/theater-management',async(req,res)=>{
 var theater =await adminHelpers.allTheaterOwners()
 res.render('admin/theater-management',{admin:true,theater,'adminDetails':req.session.admin})
})


router.get('/block-theater/:theaterId',(req,res)=>{
  adminHelpers.blockTheater(req.params.theaterId)
  res.redirect('/admin/theater-management')
})
router.get('/unblock-theater/:theaterId',(req,res)=>{
  adminHelpers.unBlockTheater(req.params.theaterId)
  res.redirect('/admin/theater-management')
})

router.get('/view-report',async(req,res)=>{
var bookingHistory = await adminHelpers.findAllBookingHistory()
res.render('admin/view-report',{admin:true,'adminDetails':req.session.admin,bookingHistory})
})
router.post('/view-report',async(req,res)=>{
  console.log(req.body)
  var bookingHistory = await adminHelpers.filterOrdersByDate(req.body)
  res.render('admin/view-filterOrders',{admin:true,'adminDetails':req.session.admin,bookingHistory})
  })




module.exports = router;
