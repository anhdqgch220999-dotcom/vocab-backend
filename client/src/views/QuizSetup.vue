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

    :global(body) {
        margin: 0 !important;
        padding: 0 !important;
        overflow-x: hidden;
    }

    .quiz-page {
        min-height: 100vh;
        width: 100%;
        background: #2dd4bf;
        padding: 0;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 40px;
    }

    .page-container {
        width: 100%;
        max-width: 700px;
        margin: 0 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        padding: 45px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.8);
    }

    h1 {
        text-align: center;
        background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 35px;
        font-size: 32px;
        font-weight: 700;
    }

    h3 {
        color: #2dd4bf;
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 20px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .quiz-form {
        display: flex;
        flex-direction: column;
        gap: 24px;
        margin-bottom: 35px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        font-size: 12px;
        font-weight: 700;
        color: #2dd4bf;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .form-group select {
        height: 42px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        background: linear-gradient(135deg, #f8fdfc 0%, #f0fdfb 100%);
        padding: 10px 14px;
        font-weight: 500;
        font-size: 14px;
        color: #1f2937;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    .form-group select:hover {
        border-color: #2dd4bf;
        background: linear-gradient(135deg, #f0fdfb 0%, #ecfdf5 100%);
    }

    .form-group select:focus {
        border-color: #2dd4bf;
        background: white;
        box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.15);
        outline: none;
    }

    .two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .ui.form .field select {
        height: 40px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        background: linear-gradient(135deg, #f8fdfc 0%, #f0fdfb 100%);
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .ui.form .field select:hover {
        border-color: #2dd4bf;
        background: linear-gradient(135deg, #f0fdfb 0%, #ecfdf5 100%);
    }

    .ui.form .field select:focus {
        border-color: #2dd4bf;
        background: white;
        box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.15);
    }

    .ui.primary.button {
        background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%) !important;
        color: white !important;
        font-weight: 700 !important;
        padding: 12px 24px !important;
        border-radius: 10px !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3) !important;
        transition: all 0.3s ease !important;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .ui.primary.button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(45, 212, 191, 0.5) !important;
    }

    .ui.primary.button:disabled {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }

    .history-section {
        border-top: 2px solid #e5e7eb;
        padding-top: 30px;
    }

    .ui.segment h3 {
        margin-top: 0;
    }
    </style>
