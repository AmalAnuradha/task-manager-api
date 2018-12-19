var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var RoomMessageSchema = new mongoose.Schema({
    roomID: String,
    userID: { type: Schema.Types.ObjectId, ref: 'user' },
    message: String,
    messageCreatedAt: { type : Date, default: Date.now }
});

var roomMessage = mongoose.model('roomMessage', RoomMessageSchema);
module.exports = roomMessage;