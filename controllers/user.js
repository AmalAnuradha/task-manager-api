var User = require('../models/user');
var Pair = require('../models/pair');
var ObjectId = require('mongoose').Types.ObjectId;
var multer = require('multer');
var path = require('path');
var bcrypt = require('bcryptjs');
const webpush = require('web-push');

module.exports = {

    update: function (req, res) {
        let param = req.params.id;

        var query = {};
        if (param) {
            query = {
                _id: param
            };
        }
        req.body.password = bcrypt.hashSync(req.body.password, 8);
        // if (req.body.password) {
        //     delete req.body.password;
        // }

        User.findOneAndUpdate(query, req.body, {
            upsert: true,
            new: true,
            $exists: true
        }).exec(function (err, doc) {
            if (err) return res.send(500, {
                error: err
            });
            console.log("succesfully saved");
            res.json(doc);
        });
    },

    all: async function (req, res) {
        let condition = {};
        let param = req.params.id;

        if (param && param.length === 24) {
            condition = {
                _id: new ObjectId(req.params.id)
            };
        } else if (param) {
            condition = {
                $or: [{
                    email: req.params.id
                }]
            };
        }

        let users = await User.find(condition);

        if (users.length === 0) {
            res.status(404).json({
                "message": "users not found"
            });
        }

        res.json(users);
    },

    delete: function (req, res) {
        User.findOneAndRemove({
                _id: req.params.id
            })
            .exec(function (err, item) {
                if (err) {
                    return res.json({
                        success: false,
                        msg: 'Cannot remove item'
                    });
                }
                if (!item) {
                    return res.status(404).json({
                        success: false,
                        msg: 'User not found'
                    });
                }
                res.json({
                    success: true,
                    msg: 'User deleted.'
                });
            });
    },
    profile: async function (req, res) {

        var file = req.file;

        // console.log(req);
        let filedata = req.file;

        let saveduser = await User.findOne({
            _id: req.user.id
        });

        if (saveduser) {
            saveduser.profile = filedata.filename;
        }
        saveduser = await saveduser.save();
        let profile = saveduser.profile;
        saveduser.profile = 'uploads/profile/' + profile;

        res.json(saveduser);
    },
    cover: async function (req, res) {

        var file = req.file;

        // console.log(req);
        let filedata = req.file;

        let saveduser = await User.findOne({
            _id: req.user.id
        });

        if (saveduser) {
            saveduser.cover = filedata.filename;
        }

        saveduser = await saveduser.save();

        res.json(saveduser);
    },
    notify: async function (req, res) {
        // VAPID keys should only be generated only once.
        const vapidKeys = {
            publicKey: "BH2sqHk2wYHxTgIT6h0cXxAYS0Ksu614KSuouV_x27KnBZGlikJ9Xkw7wQo9TL8R9ha5NtOQRjWc0Lyr90hwQOE",
            privateKey: "p5j0k0XRaWIliIVQVtJNdTAwudI7sedEqUo8yfA-Sas"
        };

        webpush.setGCMAPIKey('cgm_api_key');
        webpush.setVapidDetails(
            'mailto:example@yourdomain.org',
            vapidKeys.publicKey,
            vapidKeys.privateKey
        );

        // This is the same output of calling JSON.stringify on a PushSubscription
        const pushSubscription = {
            endpoint: 'http://localhost:3000/users/notified',
            keys: {
                auth: '.....',
                p256dh: '.....'
            }
        };
        webpush.sendNotification(pushSubscription, 'Your Push Payload Text');
    }
}