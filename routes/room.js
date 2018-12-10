var express = require('express');
var router = express.Router();
var RoomController = require('../controllers/room');

router.post('/create', function (req, res) {
    RoomController.createChatRoom(req, res);
});

router.post('/message/send', function (req, res) {
    console.log(req.body);
    RoomController.sendMessageToRoom(req, res);
});

module.exports = router;