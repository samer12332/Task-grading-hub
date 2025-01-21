const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    firstName: {
        required: true,
        type: String
    },
    lastName: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    password: {
        required: true,
        type: String
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        enum: ['ADMIN', 'STUDENT'],
        default: 'STUDENT'
    }
})

module.exports = mongoose.model('User', userSchema);