var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');

var user = require('./users');
var auth = require('./auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', auth);

router.use('/users', authController.verifyToken, user);

module.exports = router;