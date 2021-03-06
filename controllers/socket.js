var socketio = {};
var clients = {};
var Pair = require('../models/pair');
var Message = require('../models/message');
var User = require('../models/user');
var Room = require('../models/chatRooms');
var RoomUsers = require('../models/chatRoomUsers');
var RoomMesages = require('../models/roomMessages');

var handleBuddyRequest = async function (body) {
    let usersocket = clients[body.to];

    var pairUpdated = {
        status: 'request',
        from: body.from,
        to: body.to
    };
    var pairUpdatedInterchanged = {
        status: 'request',
        from: body.to,
        to: body.from
    };
    var query =

        {
            from: body.from,
            to: body.to
        };
    var queryInterchnaged =

        {
            from: body.to,
            to: body.from
        };
    options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
    };
    let pairrequest = await Pair.findOneAndUpdate(query, pairUpdated, options, function (error, result) {
        if (error) return;
        console.log(result);
    });
    let pairrequestinterchanged = await Pair.findOneAndUpdate(queryInterchnaged, pairUpdatedInterchanged, options, function (error, result) {
        if (error) return;
        console.log(result);
    });


    let object = pairrequest._doc;
    object.from = {};
    if (body.from) {
        object.from = await User.findOne({
            _id: body.from
        });
    } else {
        console.log("no request from");
    }


    if (usersocket) {
        socketio.to(usersocket).emit('pair', [object]);
        console.log("emitted: " + object);
    }
}

var handleBuddyAccept = async function (from, to) {
    let pendingRequest = await Pair.findOne({
        status: 'request',
        from: to,
        to: from,

    });
    let pendingRequestInterChanged = await Pair.findOne({
        status: 'request',
        from: from,
        to: to,

    });
    if (pendingRequest) {
        pendingRequest.blocked = 0;
        pendingRequest.status = 'accept';
        await pendingRequest.save();
    }
    if (pendingRequestInterChanged) {
        pendingRequestInterChanged.blocked = 0;
        pendingRequestInterChanged.status = 'accept';
        await pendingRequestInterChanged.save();
    }
    analyseFriendsList(from);
}

var analyzePendingRequest = async function (to) {
    let pendingRequests = await Pair.find({
        status: 'request',
        to: to
    });
    let usersocket = clients[to];
    if (usersocket) {
        socketio.to(usersocket).emit('pair', pendingRequests);
    }
}



var analyzePairdFriends = async function (to) {
    let pendingRequests = await Pair.find({
        status: 'accept',
        to: to
    });
    let usersocket = clients[to];
    for (user of usersocket) {
        user.online = (clients[user.from]) ? 1 : 0;
    }
    if (usersocket) {
        socketio.to(usersocket).emit('roster', pendingRequests);
    }
}


var analyzePendingMessages = async function (to) {
    let pendingRequests = await Message.find({
        status: 'pending',
        to: to
    });
    let usersocket = clients[to];
    if (usersocket) {
        socketio.to(usersocket).emit('message', pendingRequests);
    }
}

var analyzeOfflineRoomMessages = async function (roomname, socket) {
    let room = await Room.findOne({name : roomname})

    let messages = await RoomMesages.find({
        roomID: room._id,
    }).populate('userID');

    socket.emit('group_offline_messages', messages);
    
}

var setUserStatus = async function (userid, status) {

    var user = await User.findOneAndUpdate({
            _id: userid
        }, //filter
        {
            presence: status
        }, //data to update
        { //options
            returnNewDocument: true,
            new: true,
            strict: false
        }
    );
    console.log(user);
}

var analyseFriendsList = async function (userid) {

    let friends = await Pair.find({
        from: userid,
        status: 'accept'
    }).populate('to');

    socketio.emit('friends', friends);
}

var sendMessagesToUser = async function (socket, body) {
    let messages = await Message.find({

        $or: [{
            from: body.to,
            to: body.from
        }, {
            from: body.from,
            to: body.to
        }]

    }).populate(['from', 'to']);
    socket.emit("user_messages", messages);
}


module.exports = (io) => {
    socketio = io;

    io.use((socket, next) => {
        let id = socket.handshake.query.id;
        if (id) {
            clients[id] = socket.id;
            socket.userid = id;
            return next();
        }
        return next(new Error('authentication error'));
    });


    io.on('connection', function (socket) {
        getRequests(socket.userid, socket);

        setUserStatus(socket.userid, 'online');

        socket.on('join_chat_room', async function (body) {
            if (!body.room) {
                return "no room provided";
            }
            var chatRoom = await Room.findOne({
                name: body.room
            }, function (err, doc) {
                if (err) return "no room";
            });

            var chatUser = {
                userID: socket.userid,
                roomID: chatRoom._id
            };
            var query = {
                    userID: socket.userid,
                    roomID: chatRoom._id
                },

                options = {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                };
            await RoomUsers.findOneAndUpdate(query, chatUser, options, function (error, result) {
                if (error) return;
                console.log(result);
                socket.join(body.room);
                analyzeOfflineRoomMessages(body.room, socket);
            });
        });

        console.log('user connected ' + socket.id);
        socket.on('disconnect', () => {
            delete clients[socket.userid];
            setUserStatus(socket.userid, 'offline');
            console.log('user disconnected ' + socket.id);
        });

        socket.on('messages_ready', function (body) {
            analyseFriendsList(socket.userid);
            analyzePendingMessages(socket.userid);
        });
        socket.on('user_ready', function () {
            analyzePendingRequest(socket.userid);
            analyseFriendsList(socket.userid);
            getRequests(socket.userid, socket);
        });


        analyzePendingRequest(socket.userid);

        socket.on('send_message', async function (body) {
            var chatRoom = await Room.findOne({
                name: body.room
            }, function (err, doc) {
                if (err) return "no room";
            });

            let message = {
                message: body.message,
                userID: socket.userid,
                roomID: chatRoom._id
            };

            RoomMesages.create(message,
                async function (err, savedMessage) {
                    if (err) return "error on saving message";
                    console.log(savedMessage);
                    let object = savedMessage._doc;
                    object.userID = {};
                    if (socket.userid) {
                        object.userID = await User.findOne({
                            _id: socket.userid
                        });
                    } else {
                        console.log("no request from");
                    }
                    socketio.sockets.in(body.room).emit('group_message', object);
                });

        });
        socket.on('user_messages', function (body) {
            sendMessagesToUser(socket, body);
        });

        socket.on('message', async function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            var messagedata = {};
            messagedata = body;
            messagedata.from = socket.userid;
            messagedata.status = "pending";
            let pairdUsers = await Pair.find({
                $or: [{
                    from: socket.userid
                }, {
                    to: socket.userid
                }],
                status: 'accept',
                blocked: 0
            });

            if (pairdUsers) {
                var message = await new Message(messagedata).save();
                let messageModel = await Message.find({
                    _id: message._id
                }).populate(['from', 'to']);
                if (usersocket) {
                    body.id = message.id;
                    io.to(usersocket).emit('message', messageModel[0]);
                    console.log(messageModel);
                }


            }



        });
        
        socket.on('create_chat_room', async function (body) {
            await Room.create({name: body.room},
                function (err, room) {
                    if (err) return;
        
                    console.log("room creatded");
                });
        });
        socket.on('group_message_save', async function (body) {
            var chatRoom = await Room.findOne({
                name: body.room
            }, function (err, doc) {
                if (err) return "no room";
            });

            let message = {
                message: body.room,
                userID: socket.userid,
                roomID: chatRoom._id
            };

            await RoomMesages.create(message,
                function (err, savedMessage) {
                    if (err) return "error on saving message";
                    console.log(savedMessage);
                });
        });

        socket.on('user', function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            var emitmessage = io.to(usersocket).emit('user', body);
        });

        socket.on('search_email', async function (body) {
            console.log(body);
            let email = body.email;
            let usersocket = clients[socket.userid];
            let users = await User.find({
                email: {
                    $regex: '.*' + email + '.*'
                }
            });
            io.to(usersocket).emit('search_email', users);
            console.log(users);
        });
        socket.on('recieve message', function (body) {
            console.log(body);
            Message.update({
                _id: {
                    $in: body
                }
            }, {
                $set: {
                    "status": "recieved"
                }
            }, {
                multi: true
            }).exec(function (err, doc) {

                console.log("succesfully updated");

            });

        });
        socket.on('pair', async function (body) {
            console.log(body);
            let from = body.from;
            let to = body.to;

            if (body.status === 'request') {
                body.from = from;
                await handleBuddyRequest(body);
            } else if (body.status === 'accept') {
                await handleBuddyAccept(from, to);
            }
        });
    });
}

module.exports.addNewTask = (task) => {
    socketio.emit('task created', task);
}

module.exports.updateTask = (task) => {
    socketio.emit('task updated', task);
}
module.exports.deleteTask = (task) => {
    socketio.emit('task deleted', JSON.stringify(task));
}
module.exports.getAllTask = (task) => {
    socketio.emit('all tasks', task);
}

function getRequests(userid, socket) {
    var subscribers = Pair.find({
        'to': userid,
        'status': 'request'
    }, function (err, docs) {
        if (err) {
            return {
                success: false,
                msg: 'there was a error getting requests'
            };
        } else {
            socket.emit("requests", docs);
        }
    }).populate(['from', 'to']);
}
module.exports.unblockUser = (req, res) => {
    let param = req.params.id;
    if (!param) {
        res.status(410).json({
            message: "unblock user is not found"
        });
        return;
    } else {
        var query = {
            from: req.user.id,
            to: param
        };
    }

    let updated = {
        blocked: 0,
    }

    Pair.findOneAndUpdate(query, updated, {
        new: true,
    }).exec(function (err, doc) {
        if (err) return res.send(500, {
            error: err
        });
        console.log("succesfully unblocked");
        res.status(200).send(doc);
    });
}

module.exports.blockUser = (req, res) => {
    let param = req.params.id;
    if (!param) {
        res.status(410).json({
            message: "user is not found"
        });
        return;
    } else {
        var query = {
            from: req.user.id,
            to: param
        };
    }

    let updated = {
        blocked: 1,
    }

    Pair.findOneAndUpdate(query, updated, {

        new: true,
    }).exec(function (err, doc) {
        if (err) return res.send(500, {
            error: err
        });
        console.log("succesfully blocked");
        res.json(doc);
    });
}

module.exports.allBlockedUsers = async (req, res) => {
    let blockedUsers = await Pair.find({
        status: 'accept',
        blocked: 1
    });
    let blockedids = [];
    for (var i = 0; i < blockedUsers.length; i++) {
        for (var k in blockedUsers[i]) {
            if (k === 'to') {
                blockedids.push(blockedUsers[i][k]);
            }

        }
    };

    res.json(blockedids);;
}


module.exports.getAllFriends = async (req, res) => {

    var query = {
        status: 'accept',
        from: req.user.id
    };

    var pairs = await Pair.find(query).populate('to');

    res.status(200).send(pairs);

    console.log("succesfully retrieved");

}