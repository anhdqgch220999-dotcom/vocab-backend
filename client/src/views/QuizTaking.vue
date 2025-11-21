    <template>
    <div>
        <h1>Quiz: {{ fromLanguage }} → {{ toLanguage }}</h1>
        
        <div class="ui segment">
        <!-- Header với timer và progress -->
        <div class="ui grid">
            <div class="eight wide column">
            <div class="ui indicating progress" :data-percent="progress" id="quiz-progress">
                <div class="bar" :style="{ width: progress + '%' }"></div>
                <div class="label">Question {{ currentQuestionIndex + 1 }} / {{ questions.length }}</div>
            </div>
            </div>
            <div class="eight wide column right aligned">
            <div class="ui statistic">
                <div class="value">{{ formattedTimer }}</div>
                <div class="label">time</div>
            </div>
            </div>
        </div>

        <!-- Question -->
        <div v-if="currentQuestion" class="ui segment" style="text-align: center; padding: 40px;">
            <h2 class="ui header">
            <div class="content">
                "{{ currentQuestion.word }}"
                <div class="sub header">
                Translate from <strong>{{ fromLanguage }}</strong> to <strong>{{ toLanguage }}</strong>
                </div>
            </div>
            </h2>
            
            <div class="ui large action input" style="margin-top: 30px;">
            <input 
                type="text" 
                v-model="userAnswers[currentQuestionIndex]"
                @keyup.enter="nextQuestion"
                placeholder="Enter your answer..."
                ref="answerInput"
                style="font-size: 18px; padding: 15px;"
            />
            <button 
                class="ui primary button" 
                @click="nextQuestion"
                :disabled="!userAnswers[currentQuestionIndex]?.trim()"
            >
                {{ isLastQuestion ? 'Complete' : 'Next' }}
                <i class="right arrow icon"></i>
            </button>
            </div>
        </div>

        <!-- Navigation -->
        <div class="ui grid">
            <div class="eight wide column">
            <button 
                class="ui button" 
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
            >
                <i class="left arrow icon"></i>
                Previous
            </button>
            </div>
            <div class="eight wide column right aligned">
            <button 
                class="ui orange button" 
                @click="submitQuiz"
                :class="{ loading: isSubmitting }"
            >
                <i class="checkmark icon"></i>
                Submit Now
            </button>
            </div>
        </div>

        <!-- Question Navigator -->
        <div class="ui segment">
            <h4>Questions:</h4>
            <div class="ui buttons">
            <button 
                v-for="(question, index) in questions" 
                :key="index"
                class="ui button"
                :class="getQuestionButtonClass(index)"
                @click="goToQuestion(index)"
            >
                {{ index + 1 }}
            </button>
            </div>
        </div>
        </div>

        <!-- Confirm Submit Modal -->
        <div class="ui modal" id="confirmModal">
        <div class="header">Confirm Submission</div>
        <div class="content">
            <p>Are you sure you want to submit your quiz?</p>
            <p><strong>Questions answered:</strong> {{ answeredCount }} / {{ questions.length }}</p>
            <p><strong>Time:</strong> {{ formattedTimer }}</p>
        </div>
        <div class="actions">
            <div class="ui cancel button">Cancel</div>
            <div class="ui primary approve button" @click="confirmSubmit">Submit Quiz</div>
        </div>
        </div>
    </div>
    </template>

    <script>
    import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
    import { useRouter } from 'vue-router'
    import { submitQuiz as submitQuizAPI } from '../helpers/api'

    export default {
    name: 'QuizTaking',
    setup() {
        const router = useRouter()
        
        // Get data from sessionStorage
        const quizData = JSON.parse(sessionStorage.getItem('quizData') || '{}')
        
        const questions = ref(quizData.questions || [])
        const fromLanguage = ref(quizData.fromLanguage || '')
        const toLanguage = ref(quizData.toLanguage || '')
        const currentQuestionIndex = ref(0)
        const userAnswers = ref([])
        const startTime = ref(new Date())
        const timer = ref(0)
        const isSubmitting = ref(false)
        const answerInput = ref(null)

        // Nếu không có data, redirect về setup
        if (!questions.value.length) {
        router.push('/quiz')
        return {}
        }

        const currentQuestion = computed(() => {
        return questions.value[currentQuestionIndex.value]
        })

        const progress = computed(() => {
        return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100)
        })

        const isLastQuestion = computed(() => {
        return currentQuestionIndex.value === questions.value.length - 1
        })

        const answeredCount = computed(() => {
        return userAnswers.value.filter(answer => answer && answer.trim()).length
        })

        const formattedTimer = computed(() => {
        const minutes = Math.floor(timer.value / 60)
        const seconds = timer.value % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
        })

        // Timer
        let timerInterval = null

        const startTimer = () => {
        timerInterval = setInterval(() => {
            timer.value = Math.floor((new Date() - startTime.value) / 1000)
        }, 1000)
        }

        const stopTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval)
        }
        }

        const nextQuestion = () => {
        if (!userAnswers.value[currentQuestionIndex.value]?.trim()) return

        if (isLastQuestion.value) {
            showConfirmModal()
        } else {
            currentQuestionIndex.value++
            nextTick(() => {
            answerInput.value?.focus()
            })
        }
        }

        const previousQuestion = () => {
        if (currentQuestionIndex.value > 0) {
            currentQuestionIndex.value--
            nextTick(() => {
            answerInput.value?.focus()
            })
        }
        }

        const goToQuestion = (index) => {
        currentQuestionIndex.value = index
        nextTick(() => {
            answerInput.value?.focus()
        })
        }

        const getQuestionButtonClass = (index) => {
        const hasAnswer = userAnswers.value[index] && userAnswers.value[index].trim()
        const isCurrent = index === currentQuestionIndex.value
        
        if (isCurrent) return 'primary'
        if (hasAnswer) return 'green'
        return ''
        }

        const showConfirmModal = () => {
        // Simple confirm dialog instead of Semantic UI modal
        if (confirm(`Are you sure you want to submit?\n\nAnswered: ${answeredCount.value} / ${questions.value.length}\nTime: ${formattedTimer.value}`)) {
            confirmSubmit()
        }
        }

        const submitQuiz = () => {
        showConfirmModal()
        }

        const confirmSubmit = async () => {
        isSubmitting.value = true
        const endTime = new Date()

        try {
            // Chuẩn bị data để submit
            const answers = questions.value.map((question, index) => ({
            vocabId: question.id,
            userAnswer: userAnswers.value[index] || ''
            }))

            const quizData = {
            answers,
            startTime: startTime.value,
            endTime,
            fromLanguage: fromLanguage.value,
            toLanguage: toLanguage.value
            }

            console.log('Quiz data to submit:', quizData)
            
            const response = await submitQuizAPI(quizData)
            
            console.log('Submit response:', response)

            if (response && response.success) {
            // Clear old quiz data
            sessionStorage.removeItem('quizData')
            
            // Save results to sessionStorage
            sessionStorage.setItem('quizResult', JSON.stringify(response.result))
            
            // Navigate to results page
            router.push('/quiz/result')
            } else {
            console.error('Submit failed:', response)
            alert('Error occurred while submitting: ' + (response?.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('Submit error:', error)
            alert('Error occurred while submitting: ' + (error?.message || error))
        } finally {
            isSubmitting.value = false
        }
        }

        onMounted(() => {
        // Khởi tạo mảng answers
        userAnswers.value = new Array(questions.value.length).fill('')
        startTimer()
        nextTick(() => {
            answerInput.value?.focus()
        })
        })

        onUnmounted(() => {
        stopTimer()
        })

        return {
        questions,
        fromLanguage,
        toLanguage,
        currentQuestion,
        currentQuestionIndex,
        userAnswers,
        timer,
        progress,
        isLastQuestion,
        isSubmitting,
        answerInput,
        answeredCount,
        formattedTimer,
        nextQuestion,
        previousQuestion,
        goToQuestion,
        submitQuiz,
        confirmSubmit,
        getQuestionButtonClass
        }
    }
    }
    </script>

    <style scoped>
    .ui.progress {
    margin-bottom: 20px;
    }

    .ui.statistic {
    margin: 0;
    }

    .ui.segment h2 {
    margin-bottom: 20px;
    }

    .ui.large.input input {
    font-size: 1.2em;
    }

    .ui.buttons .button {
    margin: 2px;
    }

    .question-navigator {
    margin-top: 20px;
    }
    </style>
