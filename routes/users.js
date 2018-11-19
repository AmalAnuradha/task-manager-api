
var express = require('express');
var router = express.Router();
var userController = require('../controllers/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  userController.all(req, res);
});

router.get('/:id', function(req, res, next) {
  userController.all(req, res);
});

router.delete('/:id', function(req, res, next) {
  userController.delete(req, res);
});

router.post('/', function(req, res, next) {
  userController.update(req, res);
});

router.post('/:id', function(req, res, next) {
  userController.update(req, res);
});

module.exports = router;
