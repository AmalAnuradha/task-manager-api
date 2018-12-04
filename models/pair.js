var mongoose = require('mongoose');

var PairSchema = new mongoose.Schema({
    from: String,
    to: String,
    status: String,
    blocked: { type : Boolean, default: 1 },
    pairCreatedAt: { type : Date, default: Date.now }
});

var pair = mongoose.model('pair', PairSchema);
module.exports = pair;