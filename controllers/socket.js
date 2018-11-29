var socketio = {};
var clients = {};
var Pair = require('../models/pair');
var Message = require('../models/message');
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

        socket.on('message', function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            if (usersocket) {
                io.to(usersocket).emit('message', body);
            }
            var messagedata = {};
            messagedata = body;
            messagedata.from = socket.userid;
            Message.create(messagedata,
                function (err, pair) {});
        });

        socket.on('pair', function (body) {
            console.log(body);
            let usersocket = clients[body.to];
            body.from = socket.userid;

            if (usersocket) {
                io.to(usersocket).emit('pair', body);
            }
            var pairdata = {};
            pairdata.from = body.from;
            pairdata.to = body.to;
            pairdata.status = body.status;
            if (body.status === 'request') {
                Pair.create(pairdata,
                    function (err, pair) {});
            } else {
                var query = {
                    from: body.from,
                    to: body.to
                };
                Pair.findOneAndUpdate(query, pairdata).exec(function (err, doc) {

                    console.log("succesfully accepted");

                });
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
        'to': userid
    }, function (err, docs) {
        socket.emit("requests", docs);
    });
}