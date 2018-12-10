var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
    name: String,
    chatRoomCreatedAt: { type : Date, default: Date.now }
});

var room = mongoose.model('room', RoomSchema);
module.exports = room;