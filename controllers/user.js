var user = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;

module.exports = {

    update: function (req, res) {
        let param = req.params.id;

        var query = {};
        if (param) {
            query = { _id: param };
        }

        user.findOneAndUpdate(query, req.body, { upsert: true, new: true, $exists: true }).exec(function (err, doc) {
            if (err) return res.send(500, { error: err });
            console.log("succesfully saved");
            res.json(doc);
        });
    },

    all: async function (req, res) {
        let condition = {};
        let param = req.params.id;

        if (param && param.length === 24) {
            condition = { _id: new ObjectId(req.params.id) };
        } else if (param) {
            condition = { $or: [{ email: req.params.id }] };
        }

        let users = await user.find(condition);

        if (users.length === 0) {
            res.status(404).json({ "message": "users not found" });
        }

        res.json(users);
    },

    delete: function (req, res) {
        user.findOneAndRemove({ _id: req.params.id })
            .exec(function (err, item) {
                if (err) {
                    return res.json({ success: false, msg: 'Cannot remove item' });
                }
                if (!item) {
                    return res.status(404).json({ success: false, msg: 'User not found' });
                }
                res.json({ success: true, msg: 'User deleted.' });
            });
    },
}

