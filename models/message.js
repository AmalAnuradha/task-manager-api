var mongoose = require('mongoose');
var User = require('../models/user');
var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
    from: { type: Schema.Types.ObjectId, ref: 'user' },
    to: { type: Schema.Types.ObjectId, ref: 'user' },
    message: String,
    status: String,
    blocked: Boolean,
    messageCreatedAt: { type : Date, default: Date.now }
});

var message = mongoose.model('message', MessageSchema);
module.exports = message;