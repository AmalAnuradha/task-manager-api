    var express = require('express');
    var router = express.Router();
    var userController = require('../controllers/user');
    var multer = require('multer')
    var socketController = require('../controllers/socket');
    var upload = multer({
      dest: 'public/uploads/'
    })
    var path = require('path');

    var storageprofile = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/uploads/profile')
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
      }
    })

    var uploadprofile = multer({
      storage: storageprofile
    });

    var storagecover = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, 'public/uploads/cover')
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
      }
    })

    var uploadcover = multer({
      storage: storagecover
    });

    router.post('/unblock/:id', function (req, res) {
      socketController.unblockUser(req, res);
    });
    
    router.get('/block/all', function (req, res) {
      socketController.allBlockedUsers(req, res);
    })
    router.post('/block/:id', function (req, res) {
      socketController.blockUser(req, res);
    })

    router.get('/friends', function (req, res) {
      socketController.getAllFriends(req, res);
    })

    /* GET users listing. */
    router.get('/', function (req, res, next) {
      userController.all(req, res);
    });

    router.get('/:id', function (req, res, next) {
      userController.all(req, res);
    });

    router.delete('/:id', function (req, res, next) {
      userController.delete(req, res);
    });

    router.post('/profile', uploadprofile.single('avatar'), function (req, res, next) {
      userController.profile(req, res);
    });

    router.post('/cover', uploadcover.single('cover'), function (req, res, next) {
      userController.cover(req, res);
    });

    router.put('/:id', function (req, res, next) {
      userController.update(req, res);
    });
    module.exports = router;