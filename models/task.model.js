const mongoose = require('mongoose');


const taskSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
        
    },
    description: {
        type: String,
        required: true
        
    },
    isDone: {
        type: Boolean,
        default: false
    },
    dueDate: {
        type: Date,

    },
    createdOn: {
        type: Date,
        default: Date.now
    }
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;