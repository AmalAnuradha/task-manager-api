var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('../models/user');

var PairSchema = new mongoose.Schema({
    from: String,
    to: { type: Schema.Types.ObjectId, ref: 'user' },
    status: String,
    blocked: { type : Boolean, default: 1 },
    pairCreatedAt: { type : Date, default: Date.now }
});

var pair = mongoose.model('pair', PairSchema);
module.exports = pair;