var socketio = {};
var clients = {};
var Pair = require('../models/pair');
var Message = require('../models/message');


var handleBuddyRequest = async function (body) {
    let usersocket = clients[body.to];
    let isPaird = await Pair.findOne({
        $and: [{
                $or: [{
                    from: body.from
                }]
            },
            {
                $or: [{
                    to: body.to
                }]
            },
            {
                $or: [{
                    status: 'accept'
                }, {
                    status: 'request'
                }]
            }
        ]
    })
    if (!isPaird) {
        var pairrequest = await new Pair(body).save();
    }
    if (usersocket) {
        socketio.to(usersocket).emit('pair', [pairrequest]);
    }
}

var handleBuddyAccept = async function (from, to) {
    let pendingRequest = await Pair.findOne({
        status: 'request',
        from: to,
        to: from,
        
    });
    if (pendingRequest) {
        pendingRequest.blocked = 0;
        pendingRequest.status = 'accept';
        pendingRequest.save();
    }
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
        console.log('user connected ' + socket.id);
        socket.on('disconnect', () => {
            delete clients[socket.userid];

            console.log('user disconnected ' + socket.id);
        });

        // analyze pending requests
        analyzePendingRequest(socket.userid);

        // analyze pending requests
        // analyzePairdFriends(socket.userid);

        analyzePendingMessages(socket.userid);

        socket.on('message', async function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            var messagedata = {};
            messagedata = body;
            messagedata.from = socket.userid;
            messagedata.status = "pending";
            let pairdUsers = await Pair.find({
                $or: [{ from: socket.userid }, { to: socket.userid }], status: 'accept', blocked: 0
            });
            
            if( pairdUsers ) {
                var message = await new Message(messagedata).save();
                if (usersocket) {
                    body.id = message.id;
                    io.to(usersocket).emit('message', message);
                }
            }
            
            

        });
        socket.on('user', function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            var emitmessage = io.to(usersocket).emit('user', body);
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
            let from = socket.userid;
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
    });
}
module.exports.unblockUser = (req, res) => {
    let id = req.params.id;
    Pair.findOneAndUpdate(query, req.body, {
        to: id,
        
    }).exec(function (err, doc) {
        if (err) return res.send(500, {
            error: err
        });
        console.log("succesfully updated");
        res.json(doc);
    });
}
module.exports.allBlockedUsers = async (req, res) => {
    let blockedUsers = await Pair.find({
     status: 'accept', blocked: 1
    });
    let blockedids = [];
    for (var i=0; i < blockedUsers.length; i++) {
        for (var k in blockedUsers[i]){
            if(k === 'to'){
                blockedids.push(blockedUsers[i][k]);
            }
            
        }    
    };
    
    res.json(blockedids);;
}



