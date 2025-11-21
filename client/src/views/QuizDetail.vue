    <template>
    <div>
        <h1>Quiz Detail</h1>
        
        <div v-if="quiz">
        <!-- Summary -->
        <div class="ui segment">
            <div class="ui grid">
            <div class="eight wide column">
                <h3>Quiz Information</h3>
                <div class="ui list">
                <div class="item">
                    <strong>Date:</strong> {{ formatDate(quiz.createdAt) }}
                </div>
                <div class="item">
                    <strong>Language:</strong> {{ quiz.fromLanguage }} → {{ quiz.toLanguage }}
                </div>
                <div class="item">
                    <strong>Questions:</strong> {{ quiz.totalQuestions }}
                </div>
                <div class="item">
                    <strong>Time:</strong> {{ formatDuration(quiz.duration) }}
                </div>
                </div>
            </div>
            <div class="eight wide column">
                <div class="ui statistics">
                <div class="statistic">
                    <div class="value" :class="getScoreColor(quiz.score)">{{ quiz.score }}%</div>
                    <div class="label">Score</div>
                </div>
                <div class="statistic">
                    <div class="value green">{{ quiz.correctAnswers }}</div>
                    <div class="label">Correct</div>
                </div>
                <div class="statistic">
                    <div class="value red">{{ quiz.incorrectAnswers }}</div>
                    <div class="label">Wrong</div>
                </div>
                </div>
            </div>
            </div>
        </div>

        <!-- Performance Analysis -->
        <div class="ui segment">
            <h3>Performance Analysis</h3>
            <div class="ui progress" :class="getScoreColor(quiz.score)" :data-percent="quiz.score">
            <div class="bar" :style="{ width: quiz.score + '%' }">
                <div class="progress">{{ quiz.score }}%</div>
            </div>
            <div class="label">Accuracy Rate</div>
            </div>
            
            <div class="ui message" :class="getPerformanceMessageClass(quiz.score)">
            <div class="header">{{ getPerformanceTitle(quiz.score) }}</div>
            <p>{{ getPerformanceMessage(quiz.score) }}</p>
            </div>
        </div>

        <!-- Detailed Results -->
        <div class="ui segment">
            <h3>Question Details</h3>
            <table class="ui celled table">
            <thead>
                <tr>
                <th width="50px">No.</th>
                <th>Question ({{ quiz.fromLanguage }})</th>
                <th>Your Answer</th>
                <th>Correct Answer ({{ quiz.toLanguage }})</th>
                <th width="80px">Result</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(question, index) in quiz.questions" :key="index" :class="getRowClass(question.isCorrect)">
                <td>{{ index + 1 }}</td>
                <td><strong>{{ question.questionWord }}</strong></td>
                <td>
                    <span :class="question.isCorrect ? 'ui green text' : 'ui red text'">
                    {{ question.userAnswer || '(No answer)' }}
                    </span>
                </td>
                <td>
                    <span class="ui blue text"><strong>{{ question.correctAnswer }}</strong></span>
                </td>
                <td class="center aligned">
                    <i 
                    :class="question.isCorrect ? 'checkmark green icon' : 'close red icon'"
                    style="font-size: 1.3em;"
                    ></i>
                </td>
                </tr>
            </tbody>
            </table>
        </div>

        <!-- Mistakes Analysis -->
        <div v-if="mistakes.length > 0" class="ui segment">
            <h3>Words to Review ({{ mistakes.length }} words)</h3>
            <div class="ui cards">
            <div v-for="mistake in mistakes" :key="mistake.questionWord" class="card">
                <div class="content">
                <div class="header">{{ mistake.questionWord }}</div>
                <div class="meta">{{ quiz.fromLanguage }} → {{ quiz.toLanguage }}</div>
                <div class="description">
                    <div><strong>Your answer:</strong> <span class="ui red text">{{ mistake.userAnswer || '(No answer)' }}</span></div>
                    <div><strong>Correct answer:</strong> <span class="ui green text">{{ mistake.correctAnswer }}</span></div>
                </div>
                </div>
            </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="ui segment">
            <div class="ui buttons">
            <router-link to="/quiz" class="ui primary button">
                <i class="redo icon"></i>
                Take New Quiz
            </router-link>
            <router-link to="/quiz/history" class="ui button">
                <i class="history icon"></i>
                Back to History
            </router-link>
            <router-link to="/words" class="ui button">
                <i class="book icon"></i>
                Word List
            </router-link>
            </div>
        </div>
        </div>
        
        <div v-else-if="isLoading" class="ui loading segment" style="min-height: 200px;">
        <p>Loading quiz details...</p>
        </div>
        
        <div v-else class="ui error message">
        <div class="header">Error!</div>
        <p>{{ errorMessage || 'Cannot load quiz details' }}</p>
        <router-link to="/quiz/history" class="ui button">
            Back to Quiz History
        </router-link>
        </div>
    </div>
    </template>

    <script>
    import { ref, computed, onMounted } from 'vue'
    import { useRoute } from 'vue-router'
    import { getQuizDetail } from '../helpers/api'

    export default {
    name: 'QuizDetail',
    setup() {
        const route = useRoute()
        const quiz = ref(null)
        const isLoading = ref(false)
        const errorMessage = ref('')

        const mistakes = computed(() => {
        if (!quiz.value || !quiz.value.questions) return []
        return quiz.value.questions.filter(q => !q.isCorrect)
        })

        const loadQuizDetail = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const response = await getQuizDetail(route.params.id)
            
            if (response && response.success) {
            quiz.value = response.quiz
            } else {
            errorMessage.value = response?.message || 'Cannot load quiz detail'
            }
        } catch (err) {
            errorMessage.value = err?.message || 'An error occurred while loading quiz detail'
        } finally {
            isLoading.value = false
        }
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
        return 'Need More Practice! 💪'
        }

        const getPerformanceMessage = (score) => {
        if (score >= 90) return 'You have mastered these vocabulary words very well!'
        if (score >= 80) return 'You have a good grasp of the words. Keep practicing!'
        if (score >= 70) return 'You are on the right track. Review the words you got wrong.'
        if (score >= 60) return 'You need more practice. Review the vocabulary words below.'
        if (score >= 50) return 'You need to spend more time learning and memorizing vocabulary.'
        return 'Don\'t give up! Review from the beginning and try again.'
        }

        const getRowClass = (isCorrect) => {
        return isCorrect ? 'positive' : 'negative'
        }

        const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
        }

        const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        }

        onMounted(() => {
        loadQuizDetail()
        })

        return {
        quiz,
        isLoading,
        errorMessage,
        mistakes,
        getScoreColor,
        getPerformanceMessageClass,
        getPerformanceTitle,
        getPerformanceMessage,
        getRowClass,
        formatDate,
        formatDuration
        }
    }
    }
    </script>

    <style scoped>
    .ui.table th {
    background-color: #f9fafb;
    }

    .ui.table .center.aligned {
    text-align: center;
    }

    .ui.table tr.positive {
    background-color: #fcfff5 !important;
    }

    .ui.table tr.negative {
    background-color: #fff6f6 !important;
    }

    .ui.cards {
    margin-top: 15px;
    }

    .ui.card .header {
    font-size: 1.2em;
    color: #1e70bf;
    }

    .ui.statistics .statistic .value {
    font-size: 2em !important;
    }

    .ui.progress {
    margin: 20px 0;
    }

    .ui.loading.segment {
    position: relative;
    }
    </style>
