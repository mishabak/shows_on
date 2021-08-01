var express = require('express');
var router = express.Router();

/* GET user home page. */
router.get('/', function (req, res, next) {
  res.render('user/home-page', { user: true });
});
module.exports = router;
