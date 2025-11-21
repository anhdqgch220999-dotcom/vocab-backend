const Vocab = require('../models/vocabModel');
const QuizResult = require('../models/quizModel');

const quizController = {
    // Lấy câu hỏi quiz ngẫu nhiên
    getQuizQuestions: async (req, res) => {
        try {
            const { numberOfQuestions = 10, fromLanguage, toLanguage } = req.query;
            const userId = req.user.id;

            // Validate input
            if (!fromLanguage || !toLanguage) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select source and target languages'
                });
            }

            if (fromLanguage === toLanguage) {
                return res.status(400).json({
                    success: false,
                    message: 'Source and target languages must be different'
                });
            }

            // Get ALL vocabularies (not just user's) that contain both languages
            const allVocabs = await Vocab.find({}).populate('createdBy', 'firstName lastName username email');
            
            console.log(`Total vocabs in database: ${allVocabs.length}`);
            
            // Filter vocabs that have both languages (from usedLanguages or translations)
            const vocabsWithBothLanguages = allVocabs.filter(vocab => {
                // Check if translations object has both languages
                if (vocab.translations && typeof vocab.translations === 'object') {
                    return vocab.translations[fromLanguage] && vocab.translations[toLanguage];
                }
                return false;
            });
            
            console.log(`Vocabs with both languages (${fromLanguage}, ${toLanguage}): ${vocabsWithBothLanguages.length}`);

            if (vocabsWithBothLanguages.length < numberOfQuestions) {
                return res.status(400).json({
                    success: false,
                    message: `You only have ${vocabsWithBothLanguages.length} suitable vocabularies. Need at least ${numberOfQuestions} words to create a quiz.`
                });
            }

            // Lọc những từ có cả 2 ngôn ngữ và không rỗng
            const validVocabs = vocabsWithBothLanguages.filter(vocab => {
                const fromWord = vocab.translations && vocab.translations[fromLanguage];
                const toWord = vocab.translations && vocab.translations[toLanguage];
                return fromWord && toWord && fromWord.trim() && toWord.trim();
            });
            
            console.log(`Valid vocabs (non-empty): ${validVocabs.length}`);

            if (validVocabs.length < numberOfQuestions) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${validVocabs.length} valid vocabularies available. Need at least ${numberOfQuestions} words to create a quiz.`
                });
            }

            // Random chọn từ vựng
            const shuffled = validVocabs.sort(() => 0.5 - Math.random());
            const selectedVocabs = shuffled.slice(0, numberOfQuestions);

            // Tạo câu hỏi
            const questions = selectedVocabs.map((vocab, index) => ({
                id: vocab._id,
                questionNumber: index + 1,
                word: vocab.translations[fromLanguage],
                // Không gửi answer về client để tránh cheat
            }));

            res.json({
                success: true,
                questions,
                totalQuestions: numberOfQuestions,
                fromLanguage,
                toLanguage
            });

        } catch (error) {
            console.error('Error creating quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating quiz',
                error: error.message
            });
        }
    },

    // Chấm điểm quiz
    submitQuiz: async (req, res) => {
        try {
            const { answers, startTime, endTime, fromLanguage, toLanguage } = req.body;
            const userId = req.user.id;

            if (!answers || !Array.isArray(answers) || answers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid answer data'
                });
            }

            let correctAnswers = 0;
            let incorrectAnswers = 0;
            const questionResults = [];

            // Kiểm tra từng câu trả lời
            for (let answer of answers) {
                const vocab = await Vocab.findById(answer.vocabId);
                
                if (!vocab || !vocab.translations) continue;

                const correctAnswer = vocab.translations[toLanguage];
                const userAnswer = answer.userAnswer || '';
                
                // So sánh không phân biệt hoa thường và loại bỏ khoảng trắng
                const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
                
                if (isCorrect) {
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }

                questionResults.push({
                    vocab: vocab._id,
                    questionWord: vocab.translations[fromLanguage],
                    userAnswer: userAnswer,
                    correctAnswer: correctAnswer,
                    isCorrect
                });
            }

            const totalQuestions = answers.length;
            const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
            const duration = Math.round((new Date(endTime) - new Date(startTime)) / 1000);

            // Lưu kết quả quiz
            const quizResult = new QuizResult({
                user: userId,
                totalQuestions,
                correctAnswers,
                incorrectAnswers,
                score,
                duration,
                fromLanguage,
                toLanguage,
                questions: questionResults
            });

            await quizResult.save();

            res.json({
                success: true,
                result: {
                    quizId: quizResult._id,
                    score,
                    correctAnswers,
                    incorrectAnswers,
                    totalQuestions,
                    duration,
                    fromLanguage,
                    toLanguage,
                    questions: questionResults
                }
            });

        } catch (error) {
            console.error('Error submitting quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Error grading quiz',
                error: error.message
            });
        }
    },

    // Lấy lịch sử quiz
    getQuizHistory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;

            const quizHistory = await QuizResult.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .select('-questions'); // Không lấy chi tiết câu hỏi để giảm data

            const total = await QuizResult.countDocuments({ user: userId });

            res.json({
                success: true,
                quizHistory,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                totalQuizzes: total
            });

        } catch (error) {
            console.error('Error fetching quiz history:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching quiz history',
                error: error.message
            });
        }
    },

    // Lấy chi tiết một quiz
    getQuizDetail: async (req, res) => {
        try {
            const { quizId } = req.params;
            const userId = req.user.id;

            const quizDetail = await QuizResult.findOne({
                _id: quizId,
                user: userId
            }).populate('questions.vocab');

            if (!quizDetail) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.json({
                success: true,
                quiz: quizDetail
            });

        } catch (error) {
            console.error('Error fetching quiz detail:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching quiz detail',
                error: error.message
            });
        }
    }
};

module.exports = quizController;
