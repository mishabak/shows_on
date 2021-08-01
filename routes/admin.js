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
router.get('/', verifyLogin, function (req, res, next) {
  res.render('admin/dashboard', { admin: true });
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


module.exports = router;
