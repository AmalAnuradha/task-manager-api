var mongoose = require('mongoose');

var TaskSchema = new mongoose.Schema({
    task: String,
    user_id: String,
    complete: Boolean,
    incomplete: Boolean,
    taskCreatedAt: { type : Date, default: Date.now }
});

var task = mongoose.model('task', TaskSchema);
module.exports = task;