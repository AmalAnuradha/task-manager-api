
var express = require('express');
var router = express.Router();
var taskController = require('../controllers/task');

/* GET users listing. */
router.get('/', function(req, res, next) {
    taskController.all(req, res);
});

router.get('/:id', function(req, res, next) {
    taskController.all(req, res);
});

router.delete('/:id', function(req, res, next) {
    taskController.delete(req, res);
});

router.post('/', function(req, res, next) {
    taskController.create(req, res);
});

router.post('/:id', function(req, res, next) {
    taskController.update(req, res);
});

module.exports = router;
