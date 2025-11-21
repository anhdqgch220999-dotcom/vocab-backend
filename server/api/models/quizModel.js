const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
        max: 50
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    incorrectAnswers: {
        type: Number,
        required: true,
        min: 0
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    duration: {
        type: Number, // in seconds
        required: true,
        min: 1
    },
    fromLanguage: {
        type: String,
        required: true
    },
    toLanguage: {
        type: String,
        required: true
    },
    questions: [{
        vocab: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'vocabs'
        },
        questionWord: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
    }]
}, {
    timestamps: true,
    versionKey: false
});

// Index để tối ưu truy vấn
quizResultSchema.index({ user: 1, createdAt: -1 });
quizResultSchema.index({ user: 1, score: -1 });

const QuizResult = mongoose.model('QuizResult', quizResultSchema);

module.exports = QuizResult;
