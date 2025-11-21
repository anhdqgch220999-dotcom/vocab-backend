const mongoose = require('mongoose');

const languageModelSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    flag: {
        type: String,
        required: true,
        trim: true
    },

    isActive: {
        type:Boolean,
        default: true
    },

    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Language',languageModelSchema);