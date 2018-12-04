var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

var socketController = require('../controllers/socket');

router.post('/user/unblock/:id', function (req, res) {
    socketController.unblockUser(req, res);
});
router.get('/user/block/all', function (req, res) {
    socketController.allBlockedUsers(req, res);
})

module.exports = router;