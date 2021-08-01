var express = require('express');
var router = express.Router();

/* GET event-owner home page */
router.get('/', function (req, res, next) {
  res.render('event/dashboard', { event_owner: true })
});

module.exports = router;
