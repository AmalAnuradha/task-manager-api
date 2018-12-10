var mongoose = require('mongoose');

var RoomUsersSchema = new mongoose.Schema({
    roomID: String,
    userID: String,
    userCreatedAt: { type : Date, default: Date.now }
});

var roomUsers = mongoose.model('roomUser', RoomUsersSchema);
module.exports = roomUsers;