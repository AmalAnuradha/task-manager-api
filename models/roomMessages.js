var mongoose = require('mongoose');

var RoomMessageSchema = new mongoose.Schema({
    roomID: String,
    userID: String,
    message: String,
    messageCreatedAt: { type : Date, default: Date.now }
});

var roomMessage = mongoose.model('roomMessage', RoomMessageSchema);
module.exports = roomMessage;