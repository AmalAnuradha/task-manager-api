var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth');

var user = require('./users');

var task = require('./task');
var socket = require('./socket');
var auth = require('./auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', auth);

router.use('/users', authController.verifyToken, user);

router.use('/tasks', authController.verifyToken, task);

router.use('/socket', socket);

module.exports = router;
