require('dotenv').config();
const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mongoose = require('mongoose')
const db = process.env.MONGODB_URI || "mongodb://localhost:27017/vocab-builder";
mongoose.connect(db, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
    .then(async () => {
        console.log('Connect DB succeed !');
        
        // Fix duplicate index issue - drop old indexes
        try {
            const Vocab = require('./api/models/vocabModel');
            const indexes = await Vocab.collection.getIndexes();
            console.log('Current indexes:', Object.keys(indexes));
            
            // Drop indexes that might cause duplicate key errors
            for (const indexName of Object.keys(indexes)) {
                if (indexName.includes('english') || indexName.includes('german') || indexName.includes('_1')) {
                try {
                    await Vocab.collection.dropIndex(indexName);
                    console.log(`Dropped index: ${indexName}`);
                } catch (err) {
                    console.log(`Could not drop index ${indexName}:`, err.message);
                }
                }
            }
        } catch (err) {
            console.log('Index cleanup skipped:', err.message);
        }
        
        // Initialize default languages after DB connection
        const { initializeDefaultLanguages } = require('./api/controllers/languageController');
        console.log('Initializing default languages...');
        initializeDefaultLanguages().then(() => {
            console.log('Languages initialization complete');
        }).catch(err => console.error('Languages initialization error:', err));
    })
    .catch(err => console.log('Connect db failed ! ' + err))

// Routes
const vocabRouter = require("./api/routes/vocabRoute")
const authRouter = require("./api/routes/authRoute")
const userRouter = require("./api/routes/userRoute")
const languageRouter = require("./api/routes/languageRoute")
const quizRouter = require("./api/routes/quizRoute")

vocabRouter(app)
authRouter(app)
userRouter(app)
quizRouter(app)
app.use('/api/languages', languageRouter)

// Health check endpoint
app.get('/', (req, res) => {
   res.json({ message: 'Vocabulary Builder API is running', status: 'ok' })
})

const port = process.env.PORT || 3001

app.listen(port, () => {
   console.log("Server is running at http://localhost:" + port)
})