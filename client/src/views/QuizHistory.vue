    <template>
    <div>
        <h1>Quiz History</h1>
        
        <div class="ui segment">
        <div v-if="quizHistory.length > 0">
            <table class="ui celled table">
            <thead>
                <tr>
                <th>Date</th>
                <th>Language</th>
                <th>Questions</th>
                <th>Correct/Wrong</th>
                <th>Score</th>
                <th>Time</th>
                <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="quiz in quizHistory" :key="quiz._id">
                <td>{{ formatDate(quiz.createdAt) }}</td>
                <td>
                    <strong>{{ quiz.fromLanguage }}</strong> → <strong>{{ quiz.toLanguage }}</strong>
                </td>
                <td>{{ quiz.totalQuestions }}</td>
                <td>
                    <span class="ui green text">{{ quiz.correctAnswers }}</span> / 
                    <span class="ui red text">{{ quiz.incorrectAnswers }}</span>
                </td>
                <td>
                    <div class="ui label" :class="getScoreColor(quiz.score)">
                    {{ quiz.score }}%
                    </div>
                </td>
                <td>{{ formatDuration(quiz.duration) }}</td>
                <td>
                    <router-link 
                    :to="{ name: 'QuizDetail', params: { id: quiz._id } }"
                    class="ui small primary button"
                    >
                    <i class="eye icon"></i>
                    View
                    </router-link>
                </td>
                </tr>
            </tbody>
            </table>
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="ui pagination menu">
            <a 
                class="item" 
                :class="{ disabled: currentPage === 1 }"
                @click="changePage(currentPage - 1)"
            >
                <i class="left chevron icon"></i>
            </a>
            
            <a 
                v-for="page in visiblePages" 
                :key="page"
                class="item"
                :class="{ active: page === currentPage }"
                @click="changePage(page)"
            >
                {{ page }}
            </a>
            
            <a 
                class="item"
                :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)"
            >
                <i class="right chevron icon"></i>
            </a>
            </div>
        </div>
        
        <div v-else-if="!isLoading" class="ui message">
            <div class="header">No quiz history</div>
            <p>You haven't taken any quiz yet. Start your first quiz!</p>
            <router-link to="/quiz" class="ui primary button">
            <i class="play icon"></i>
            Start Quiz
            </router-link>
        </div>
        
        <div v-if="isLoading" class="ui active loader"></div>
        
        <div v-if="errorMessage" class="ui error message">
            <div class="header">Error!</div>
            <p>{{ errorMessage }}</p>
        </div>
        </div>
        
        <div class="ui segment">
        <router-link to="/quiz" class="ui primary button">
            <i class="plus icon"></i>
            Take New Quiz
        </router-link>
        <router-link to="/words" class="ui button">
            <i class="book icon"></i>
            Back to Words
        </router-link>
        </div>
    </div>
    </template>

    <script>
    import { ref, computed, onMounted } from 'vue'
    import { getQuizHistory } from '../helpers/api'

    export default {
    name: 'QuizHistory',
    setup() {
        const quizHistory = ref([])
        const isLoading = ref(false)
        const errorMessage = ref('')
        const currentPage = ref(1)
        const totalPages = ref(1)
        const limit = 10

        const loadQuizHistory = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const response = await getQuizHistory({ page, limit })
            
            if (response && response.success) {
            quizHistory.value = response.quizHistory
            totalPages.value = response.totalPages
            currentPage.value = response.currentPage
            } else {
            errorMessage.value = response?.message || 'Cannot load quiz history'
            }
        } catch (err) {
            errorMessage.value = err?.message || 'Error occurred while loading quiz history'
        } finally {
            isLoading.value = false
        }
        }

        const changePage = (page) => {
        if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
            loadQuizHistory(page)
        }
        }

        const visiblePages = computed(() => {
        const pages = []
        const maxVisible = 5
        const start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
        const end = Math.min(totalPages.value, start + maxVisible - 1)
        
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return pages
        })

        const getScoreColor = (score) => {
        if (score >= 80) return 'green'
        if (score >= 60) return 'yellow'
        return 'red'
        }

        const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
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
        loadQuizHistory()
        })

        return {
        quizHistory,
        isLoading,
        errorMessage,
        currentPage,
        totalPages,
        visiblePages,
        changePage,
        getScoreColor,
        formatDate,
        formatDuration
        }
    }
    }
    </script>

    <style scoped>
    .ui.pagination.menu {
    margin-top: 20px;
    }

    .ui.statistics {
    justify-content: space-around;
    }

    .ui.table th {
    background-color: #f9fafb;
    }

    .ui.active.loader {
    position: relative;
    margin: 40px auto;
    }
    </style>
