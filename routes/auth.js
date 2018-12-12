var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/user');
var authController = require('../controllers/auth');
var user = require('../models/user');

router.post('/register', function (req, res) {

  authController.register(req, res);
});

router.post('/register/admin', function (req, res) {

  authController.registerAdmin(req, res);
});

router.get('/me', authController.verifyToken , function (req, res) {
  authController.me(req, res);
});

router.post('/login', function(req, res) {
  authController.login(req, res);
});

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

module.exports = router;