var mongoose = require('mongoose');

var PairSchema = new mongoose.Schema({
    from: String,
    to: String,
    status: String,
    pairCreatedAt: { type : Date, default: Date.now }
});

var pair = mongoose.model('pair', PairSchema);
module.exports = pair;