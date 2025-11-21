    <template>
    <div>
        <h1>Quiz Result</h1>
        
        <div v-if="result">
        <!-- Summary Card -->
        <div class="ui segment">
            <div class="ui grid">
            <div class="eight wide column">
                <div class="ui statistic">
                <div class="value" :class="getScoreColor(result.score)">
                    {{ result.score }}%
                </div>
                <div class="label">Score</div>
                </div>
            </div>
            <div class="eight wide column">
                <div class="ui statistics">
                <div class="statistic">
                    <div class="value green">{{ result.correctAnswers }}</div>
                    <div class="label">Correct</div>
                </div>
                <div class="statistic">
                    <div class="value red">{{ result.incorrectAnswers }}</div>
                    <div class="label">Wrong</div>
                </div>
                <div class="statistic">
                    <div class="value">{{ formatDuration(result.duration) }}</div>
                    <div class="label">Time</div>
                </div>
                </div>
            </div>
            </div>
            
            <div class="ui divider"></div>
            
            <div class="ui grid">
            <div class="sixteen wide column">
                <p><strong>Language:</strong> {{ result.fromLanguage }} → {{ result.toLanguage }}</p>
                <p><strong>Total Questions:</strong> {{ result.totalQuestions }}</p>
                <p><strong>Accuracy:</strong> {{ Math.round((result.correctAnswers / result.totalQuestions) * 100) }}%</p>
            </div>
            </div>
        </div>

        <!-- Performance Message -->
        <div class="ui message" :class="getPerformanceMessageClass(result.score)">
            <div class="header">{{ getPerformanceTitle(result.score) }}</div>
            <p>{{ getPerformanceMessage(result.score) }}</p>
        </div>

        <!-- Detailed Results -->
        <div class="ui segment">
            <h3>Answer Details</h3>
            <table class="ui celled table">
            <thead>
                <tr>
                <th width="50px">No.</th>
                <th>Question</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
                <th width="80px">Result</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(question, index) in result.questions" :key="index">
                <td>{{ index + 1 }}</td>
                <td><strong>{{ question.questionWord }}</strong></td>
                <td>
                    <span :class="question.isCorrect ? 'ui green text' : 'ui red text'">
                    {{ question.userAnswer || '(No answer)' }}
                    </span>
                </td>
                <td>
                    <span class="ui blue text">{{ question.correctAnswer }}</span>
                </td>
                <td class="center aligned">
                    <i 
                    :class="question.isCorrect ? 'checkmark green icon' : 'close red icon'"
                    style="font-size: 1.2em;"
                    ></i>
                </td>
                </tr>
            </tbody>
            </table>
        </div>

        <!-- Action Buttons -->
        <div class="ui segment">
            <div class="ui buttons">
            <router-link to="/quiz" class="ui primary button">
                <i class="redo icon"></i>
                Take New Quiz
            </router-link>
            <router-link to="/quiz/history" class="ui button">
                <i class="history icon"></i>
                View History
            </router-link>
            <router-link to="/words" class="ui button">
                <i class="book icon"></i>
                Back to Words
            </router-link>
            </div>
        </div>
        </div>
        
        <div v-else class="ui loading segment" style="min-height: 200px;">
        <p>Loading results...</p>
        </div>
    </div>
    </template>

    <script>
    import { ref, onMounted } from 'vue'
    import { useRouter } from 'vue-router'

    export default {
    name: 'QuizResult',
    setup() {
        const router = useRouter()
        
        // Get results from sessionStorage
        const resultData = JSON.parse(sessionStorage.getItem('quizResult') || '{}')
        const result = ref(resultData)

        // Nếu không có data, redirect về setup
        if (!result.value || result.value.score === undefined) {
        router.push('/quiz')
        return {}
        }

        const getScoreColor = (score) => {
        if (score >= 80) return 'green'
        if (score >= 60) return 'yellow'
        return 'red'
        }

        const getPerformanceMessageClass = (score) => {
        if (score >= 80) return 'positive'
        if (score >= 60) return 'warning'
        return 'negative'
        }

        const getPerformanceTitle = (score) => {
        if (score >= 90) return 'Excellent! 🎉'
        if (score >= 80) return 'Very Good! 👏'
        if (score >= 70) return 'Good! 👍'
        if (score >= 60) return 'Fair! 🙂'
        if (score >= 50) return 'Average 😐'
        return 'Keep trying! 💪'
        }

        const getPerformanceMessage = (score) => {
        if (score >= 90) return 'You have mastered these vocabulary words very well! Try quiz with more words.'
        if (score >= 80) return 'You have a good grasp. Keep practicing to get higher scores.'
        if (score >= 70) return 'You are on the right track. Review the words you got wrong.'
        if (score >= 60) return 'You need more practice. Review the vocabulary and try again.'
        if (score >= 50) return 'You need to spend more time learning and memorizing vocabulary.'
        return 'Don\'t give up! Review from the beginning and try again. You will improve!'
        }

        const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        }

        onMounted(() => {
        // Auto scroll to top
        window.scrollTo(0, 0)
        
        // Clear results after display to avoid cache
        setTimeout(() => {
            sessionStorage.removeItem('quizResult')
        }, 1000)
        })

        return {
        result,
        getScoreColor,
        getPerformanceMessageClass,
        getPerformanceTitle,
        getPerformanceMessage,
        formatDuration
        }
    }
    }
    </script>

    <style scoped>
    .ui.statistic .value {
    font-size: 3em !important;
    }

    .ui.statistics .statistic .value {
    font-size: 2em !important;
    }

    .ui.table th {
    background-color: #f9fafb;
    }

    .ui.table .center.aligned {
    text-align: center;
    }

    .ui.buttons {
    margin-top: 0;
    }

    .ui.message {
    margin: 20px 0;
    }

    .ui.loading.segment {
    position: relative;
    }
    </style>
