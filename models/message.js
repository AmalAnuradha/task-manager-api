var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    from: String,
    to: String,
    message: String,
    status: String,
    messageCreatedAt: { type : Date, default: Date.now }
});

var message = mongoose.model('message', MessageSchema);
module.exports = message;