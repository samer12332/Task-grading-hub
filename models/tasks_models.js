const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    deadline: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: new Date
    }
});

module.exports = mongoose.model('Task', taskSchema);