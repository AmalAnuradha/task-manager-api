var socketio = {};
var clients = {};

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