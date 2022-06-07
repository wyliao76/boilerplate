const mongoose = require('mongoose')
const { Schema } = mongoose

const UsersSchema = new Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    role: {
        type: String,
        default: 'normal',
        enum: ['admin', 'normal'],
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    enable: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
        default: '',
    },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})

module.exports = mongoose.model('Users', UsersSchema)

