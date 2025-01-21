const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    taskId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    userEmail: {
        type: String,
        required: true
    },
    filePath: {
        type: String
    },
    fileName: {
        type: String,
        required: true
    },
    submissionDate: {
        type: Date,
        default: new Date 
    },
    grade: {
        type: Number,
        min: 0,
        max: 100
    },
    feedback: {
        type: String
    }
});

module.exports = mongoose.model('Submission', submissionSchema);