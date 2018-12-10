var Room = require('../models/chatRooms');
var RoomUsers = require('../models/chatRoomUsers');
var ob = require('./socket');

module.exports.createChatRoom = async (req, res) => {
    await Room.create(req.body,
        function (err, room) {
            if (err) return res.status(500).send("There was a problem creating the chat room.");

            res.status(200).send(room);
        });
}

module.exports.sendMessageToRoom = (req, res) => { 
    if(req.body.message && req.body.room){
        ob.sendToRoom(req.body.message,req.body.room);
    }  
}