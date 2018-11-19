var bcrypt = require('bcryptjs');
var config = require('../config');
var jwt = require('jsonwebtoken');
var config = require('../config');

var user = require('../models/user');

module.exports = {

    register: function (req, res) {

        user.create(req.body,
            function (err, user) {
                if (err) return res.status(500).send("There was a problem registering the user.")

                let newuser = user.tokenizedUser();
                res.status(200).send(newuser);
            });

    },

    me: function (req, res) {

        var token = req.headers['authorization'];
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });

            user.findById(decoded.id,
                { password: 0 }, // projection
                function (err, user) {
                    if (err) return res.status(500).send("There was a problem finding the user.");
                    if (!user) return res.status(404).send("No user found.");
                    res.status(200).send(user);
                });
        });
    },

    login: function (req, res) {
        user.findOne({ email: req.body.email }, function (err, user) {
            if (err) return res.status(500).send('Error on the server.');

            if (!user) return res.status(404).send('No user found.');

            var passwordIsValid = user.validatePassword(req.body.password);
            if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

            let newuser = user.tokenizedUser();
            res.status(200).send(newuser);
        });
    },

    verifyToken: function(req, res, next) {
        var token = req.headers['authorization'];
        if (!token)
          return res.status(403).send({ auth: false, message: 'No token provided.' });

        jwt.verify(token, config.secret, function(err, decoded) {
          if (err)
          return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
          // if everything good, save to request for use in other routes
          req.user = decoded;
          next();
        });

      }

}

