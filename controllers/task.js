var Task = require('../models/task');
var ObjectId = require('mongoose').Types.ObjectId;

var ob = require('./socket');

module.exports = {

    update: function (req, res) {
        var isUpdate = false;
        let param = req.params.id;

        var query = {};
        if (param) {
            isUpdate = true;
            query = { _id: param };
        }
        req.body.user_id = req.user.id;    
        Task.findOneAndUpdate(query, req.body, { upsert: true, new: true, $exists: true }).exec(function (err, doc) {
            if (err) return res.send(500, { error: err });
            console.log("succesfully saved");
            ob.updateTask(doc);
            res.json(doc);
            
            
            

        });
    },
    create: function (req, res) {
        req.body.user_id = req.user.id;
        Task.create(req.body,
            function (err, task) {
                if (err) return res.status(500).send("There was a problem registering the user.");
                ob.addNewTask(task);
                res.status(200).send(task);
                
                
                
                
            });
    },

    all: async function (req, res) {
        let condition = {};
        let param = req.params.id;

        if (param) {
            condition = { _id: new ObjectId(param) };
        } 
        
        let tasks = await Task.find(condition);

        if (tasks.length === 0) {
            res.status(404).json({ "message": "tasks not found" });
        }

        ob.getAllTask(tasks);

        res.json(tasks);
    },

    delete: function (req, res) {
        Task.findOneAndRemove({ _id: req.params.id })
            .exec(function (err, item) {
                if (err) {
                    return res.json({ success: false, msg: 'Cannot remove item' });
                }
                if (!item) {
                    return res.status(404).json({ success: false, msg: 'Task not found' });
                }
                ob.deleteTask(item);
                res.json({ success: true, msg: 'Task deleted.' });
                
                
            });
    },
}