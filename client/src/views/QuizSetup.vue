    <template>
    <div class="quiz-page">
        <div class="page-container">
            <h1>Quiz Setup</h1>
            
            <form class="quiz-form" @submit.prevent="startQuiz">
                <div class="form-group">
                    <label>Number of Questions</label>
                    <select v-model="quizSettings.numberOfQuestions" class="ui dropdown">
                        <option value="5">5 questions</option>
                        <option value="10">10 questions</option>
                        <option value="15">15 questions</option>
                        <option value="20">20 questions</option>
                        <option value="25">25 questions</option>
                    </select>
                </div>

                <div class="two-cols">
                    <div class="form-group">
                        <label>From Language (Question)</label>
                        <select v-model="quizSettings.fromLanguage" class="ui dropdown">
                            <option value="">Select language</option>
                            <option v-for="lang in availableLanguages" :key="lang._id" :value="lang.code">
                                {{ lang.name }}
                            </option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>To Language (Answer)</label>
                        <select v-model="quizSettings.toLanguage" class="ui dropdown">
                            <option value="">Select language</option>
                            <option v-for="lang in availableLanguages" :key="lang._id" :value="lang.code">
                                {{ lang.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    class="ui primary button"
                    :class="{ loading: isLoading }"
                    :disabled="!canStartQuiz"
                >
                    <i class="play icon"></i>
                    Start Quiz
                </button>

                <div v-if="errorMessage" class="ui error message">
                    <div class="header">Error!</div>
                    <p>{{ errorMessage }}</p>
                </div>
            </form>

            <!-- Quiz History -->
            <div class="history-section">
                <h3>Recent Quiz History</h3>
                <div v-if="recentQuizzes.length > 0">
                    <table class="ui celled table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Language</th>
                                <th>Questions</th>
                                <th>Score</th>
                                <th>Time</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="quiz in recentQuizzes" :key="quiz._id">
                                <td>{{ formatDate(quiz.createdAt) }}</td>
                                <td>
                                    {{ quiz.fromLanguage }} → {{ quiz.toLanguage }}
                                </td>
                                <td>{{ quiz.totalQuestions }}</td>
                                <td>
                                    <div class="ui label" :class="getScoreColor(quiz.score)">
                                        {{ quiz.score }}%
                                    </div>
                                </td>
                                <td>{{ formatDuration(quiz.duration) }}</td>
                                <td>
                                    <router-link 
                                        :to="{ name: 'QuizDetail', params: { id: quiz._id } }"
                                        class="ui small blue button"
                                    >
                                        View
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <router-link to="/quiz/history" class="ui button">
                        View All History
                    </router-link>
                </div>
                <div v-else class="ui message">
                    <p>You haven't taken any quiz yet. Start your first quiz!</p>
                </div>
            </div>
        </div>
    </div>
    </template>

    <script>
    import { ref, computed, onMounted } from 'vue'
    import { useRouter } from 'vue-router'
    import { getActiveLanguages, getQuizQuestions, getQuizHistory } from '../helpers/api'

    export default {
    name: 'QuizSetup',
    setup() {
        const router = useRouter()
        const isLoading = ref(false)
        const errorMessage = ref('')
        const availableLanguages = ref([])
        const recentQuizzes = ref([])
        
        const quizSettings = ref({
        numberOfQuestions: 10,
        fromLanguage: '',
        toLanguage: ''
        })

        const canStartQuiz = computed(() => {
        return quizSettings.value.fromLanguage && 
                quizSettings.value.toLanguage && 
                quizSettings.value.fromLanguage !== quizSettings.value.toLanguage
        })

        const loadLanguages = async () => {
        try {
            const response = await getActiveLanguages()
            if (response && response.success) {
            availableLanguages.value = response.languages
            }
        } catch (err) {
            errorMessage.value = 'Cannot load language list'
        }
        }

        const loadRecentQuizzes = async () => {
        try {
            const response = await getQuizHistory({ limit: 5 })
            if (response && response.success) {
            recentQuizzes.value = response.quizHistory
            }
        } catch (err) {
            console.error('Error loading recent quizzes:', err)
        }
        }

        const startQuiz = async () => {
        if (!canStartQuiz.value) return

        isLoading.value = true
        errorMessage.value = ''

        try {
            const response = await getQuizQuestions(quizSettings.value)

            if (response && response.success) {
            // Save data to sessionStorage
            sessionStorage.setItem('quizData', JSON.stringify({
                questions: response.questions,
                settings: quizSettings.value,
                fromLanguage: response.fromLanguage,
                toLanguage: response.toLanguage
            }))
            
            // Navigate to quiz taking page
            router.push('/quiz/taking')
            } else {
            errorMessage.value = response?.message || 'Error occurred while creating quiz'
            }
        } catch (err) {
            errorMessage.value = err?.message || 'Error occurred while creating quiz'
        } finally {
            isLoading.value = false
        }
        }

        const getScoreColor = (score) => {
        if (score >= 80) return 'green'
        if (score >= 60) return 'yellow'
        return 'red'
        }

        const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN')
        }

        const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
        }

        onMounted(() => {
        loadLanguages()
        loadRecentQuizzes()
        })

        return {
        quizSettings,
        isLoading,
        errorMessage,
        availableLanguages,
        recentQuizzes,
        canStartQuiz,
        startQuiz,
        getScoreColor,
        formatDate,
        formatDuration
        }
    }
    }
    </script>

    <style scoped>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .quiz-page {
        width: 100vw;
        min-height: 100vh;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        padding: 40px 20px;
        display: flex;
        justify-content: center;
    }

    .page-container {
        width: 100%;
        max-width: 700px;
        background: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    h1 {
        text-align: center;
        color: #1f2937;
        margin-bottom: 30px;
        font-size: 28px;
    }

    h3 {
        color: #1f2937;
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 20px;
    }

    .quiz-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 30px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .ui.form .field select {
        height: 38px;
    }

    .ui.error.message {
        margin-top: 15px;
    }

    .history-section {
        border-top: 2px solid #e5e7eb;
        padding-top: 30px;
    }

    .ui.segment h3 {
        margin-top: 0;
    }
    </style>
