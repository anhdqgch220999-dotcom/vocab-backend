const QuizController = require("../controllers/quizController")
const { auth } = require("../middlware/auth")

const QuizRoute = (app) => {
   // GET /quiz/questions - Lấy câu hỏi quiz
   app.route('/quiz/questions')
      .get(auth, QuizController.getQuizQuestions)

   // POST /quiz/submit - Nộp bài quiz
   app.route('/quiz/submit')
      .post(auth, QuizController.submitQuiz)

   // GET /quiz/history - Lấy lịch sử quiz
   app.route('/quiz/history')
      .get(auth, QuizController.getQuizHistory)

   // GET /quiz/:quizId - Lấy chi tiết quiz
   app.route('/quiz/:quizId')
      .get(auth, QuizController.getQuizDetail)
}

module.exports = QuizRoute
