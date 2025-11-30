<template>
  <div class="matching-container">
    <h1>Word Matching Game</h1>
    
    <!-- Game Setup (before game starts) -->
    <div v-if="gameStatus === 'setup'" class="setup-section">
      <div class="ui form">
        <div class="two fields">
          <div class="field">
            <label>Column 1 Language</label>
            <select v-model="language1" class="ui dropdown compact">
              <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label>Column 2 Language</label>
            <select v-model="language2" class="ui dropdown compact">
              <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="one field">
          <label>Number of Words</label>
          <select v-model.number="numWords" class="ui dropdown compact" style="width: 150px;">
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="8">8</option>
            <option value="10">10</option>
          </select>
        </div>
      </div>
      <button @click="startGame" class="ui primary button" style="margin-top: 20px;">
        Start Game
      </button>
      <router-link to="/words" class="ui button" style="margin-left: 10px;">Back to Words</router-link>
    </div>

    <!-- Game Stats -->
    <div v-if="gameStatus === 'playing'" class="stats">
      <div class="stat-item">
        <i class="clock outline icon"></i>
        <span>Time: {{ formatTime(timeRemaining) }}</span>
      </div>
      <div class="stat-item">
        <i class="check icon"></i>
        <span>Matches: {{ correctMatches }}/{{ totalPairs }}</span>
      </div>
      <div class="stat-item">
        <i class="star icon"></i>
        <span>Score: {{ score }}</span>
      </div>
    </div>

    <!-- Game Status -->
    <div v-if="gameStatus === 'loading'" class="loading">
      <div class="ui active inline mini loader"></div>
      Loading game...
    </div>

    <div v-else-if="gameStatus === 'playing'" class="game-board">
      <div class="language-headers">
        <div class="language-col">
          <i :class="`${getLanguageFlag(language1)} flag`"></i>
          {{ getLanguageName(language1) }}
        </div>
        <div class="language-col">
          <i :class="`${getLanguageFlag(language2)} flag`"></i>
          {{ getLanguageName(language2) }}
        </div>
      </div>

      <div class="columns">
        <!-- Left column -->
        <div class="column">
          <div
            v-for="(item, index) in leftColumn"
            :key="'left-' + index"
            @click="selectItem('left', index)"
            :class="['word-box', { 
              selected: selectedLeft === index,
              matched: matchedPairs.has(item._id)
            }]"
          >
            {{ item.translations[language1] }}
          </div>
        </div>

        <!-- Right column -->
        <div class="column">
          <div
            v-for="(item, index) in rightColumn"
            :key="'right-' + index"
            @click="selectItem('right', index)"
            :class="['word-box', { 
              selected: selectedRight === index,
              matched: matchedPairs.has(item._id)
            }]"
          >
            {{ item.translations[language2] }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="gameStatus === 'finished'" class="game-result">
      <h2>Game Over!</h2>
      <p class="final-score">Final Score: {{ score }}</p>
      <p class="matches-text">You matched {{ correctMatches }}/{{ totalPairs }} pairs</p>
      <button @click="resetGame" class="ui primary button">Play Again</button>
      <router-link to="/words" class="ui button">Back to Words</router-link>
    </div>

    <!-- Back button -->
    <div v-if="gameStatus !== 'finished' && gameStatus !== 'setup'" style="margin-top: 20px;">
      <router-link to="/words" class="ui button">Back to Words</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { viewAllWords, getActiveLanguages } from '../helpers/api';

export default {
  name: 'Matching',
  setup() {
    const words = ref([]);
    const availableLanguages = ref([]);
    const language1 = ref('en');
    const language2 = ref('vn');
    const numWords = ref(10);
    
    const gameStatus = ref('setup');
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    const correctMatches = ref(0);
    const score = ref(0);
    const timeRemaining = ref(180);
    const matchedPairs = ref(new Set());
    const rightColumnShuffled = ref([]);
    let gameTimer = null;

    const leftColumn = computed(() => {
      return words.value;
    });

    const rightColumn = computed(() => {
      return rightColumnShuffled.value;
    });

    const totalPairs = computed(() => leftColumn.value.length);

    // Shuffle array
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Get language name
    const getLanguageName = (langCode) => {
      const lang = availableLanguages.value.find(l => l.code === langCode);
      return lang ? lang.name : langCode.toUpperCase();
    };

    // Get language flag
    const getLanguageFlag = (langCode) => {
      const lang = availableLanguages.value.find(l => l.code === langCode);
      return lang ? lang.flag : '';
    };

    // Fetch available languages
    const fetchLanguages = async () => {
      try {
        const langResponse = await getActiveLanguages();
        if (langResponse && langResponse.languages) {
          availableLanguages.value = langResponse.languages;
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        availableLanguages.value = [
          { code: 'en', name: 'English', flag: 'us' },
          { code: 'vn', name: 'Vietnamese', flag: 'vn' },
          { code: 'de', name: 'German', flag: 'de' },
          { code: 'fr', name: 'French', flag: 'fr' }
        ];
      }
    };

    // Start game
    const startGame = async () => {
      gameStatus.value = 'loading';
      await loadGame();
    };

    // Reset game to setup screen
    const resetGame = () => {
      selectedLeft.value = null;
      selectedRight.value = null;
      correctMatches.value = 0;
      score.value = 0;
      timeRemaining.value = 180;
      matchedPairs.value = new Set();
      rightColumnShuffled.value = [];
      words.value = [];
      gameStatus.value = 'setup';
    };

    // Select item
    const selectItem = (side, index) => {
      if (side === 'left') {
        if (matchedPairs.value.has(leftColumn.value[index]._id)) return;
        selectedLeft.value = selectedLeft.value === index ? null : index;
      } else {
        if (matchedPairs.value.has(rightColumn.value[index]._id)) return;
        selectedRight.value = selectedRight.value === index ? null : index;
      }

      // Check if both selected
      if (selectedLeft.value !== null && selectedRight.value !== null) {
        checkMatch();
      }
    };

    // Check if match
    const checkMatch = () => {
      const leftWord = leftColumn.value[selectedLeft.value];
      const rightWord = rightColumn.value[selectedRight.value];

      if (leftWord && rightWord && leftWord._id === rightWord._id) {
        correctMatches.value++;
        score.value += 10;
        matchedPairs.value.add(leftWord._id);
        selectedLeft.value = null;
        selectedRight.value = null;

        if (correctMatches.value === totalPairs.value) {
          endGame();
        }
      } else {
        setTimeout(() => {
          selectedLeft.value = null;
          selectedRight.value = null;
        }, 500);
      }
    };

    // Format time
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Load game
    const loadGame = async () => {
      try {
        gameStatus.value = 'loading';
        
        const response = await viewAllWords();
        const wordList = response?.vocabs || response || [];
        
        console.log('Total words from API:', wordList.length);
        if (wordList.length > 0) {
          console.log('First word structure:', wordList[0]);
        }
        
        const filteredWords = wordList
          .filter(word => 
            word.translations &&
            word.translations[language1.value] &&
            word.translations[language2.value]
          )
          .slice(0, numWords.value);

        console.log('Filtered words for matching:', filteredWords.length);
        if (filteredWords.length > 0) {
          console.log('First filtered word:', filteredWords[0]);
        }

        if (filteredWords.length >= 4) {
          words.value = filteredWords;
          // Shuffle ALL words for right column
          rightColumnShuffled.value = shuffleArray([...filteredWords]);
          console.log('Left column:', filteredWords.map(w => w.translations[language1.value]));
          console.log('Right column:', rightColumnShuffled.value.map(w => w.translations[language2.value]));
          gameStatus.value = 'playing';
          startTimer();
        } else {
          console.error('Not enough words with both languages:', filteredWords.length);
          alert(`Not enough words. Found ${filteredWords.length} words with both ${language1.value.toUpperCase()} and ${language2.value.toUpperCase()}`);
          gameStatus.value = 'setup';
        }
      } catch (error) {
        console.error('Error loading game:', error);
        gameStatus.value = 'setup';
      }
    };

    // Start timer
    const startTimer = () => {
      gameTimer = setInterval(() => {
        timeRemaining.value--;
        if (timeRemaining.value <= 0) {
          endGame();
        }
      }, 1000);
    };

    // End game
    const endGame = () => {
      if (gameTimer) clearInterval(gameTimer);
      gameStatus.value = 'finished';
    };

    // Start new game
    const startNewGame = () => {
      selectedLeft.value = null;
      selectedRight.value = null;
      correctMatches.value = 0;
      score.value = 0;
      timeRemaining.value = 180;
      matchedPairs.value = new Set();
      rightColumnShuffled.value = [];
      loadGame();
    };

    onMounted(() => {
      fetchLanguages();
    });

    onUnmounted(() => {
      if (gameTimer) clearInterval(gameTimer);
    });

    return {
      words,
      availableLanguages,
      language1,
      language2,
      numWords,
      gameStatus,
      selectedLeft,
      selectedRight,
      correctMatches,
      score,
      timeRemaining,
      matchedPairs,
      leftColumn,
      rightColumn,
      totalPairs,
      selectItem,
      getLanguageName,
      getLanguageFlag,
      formatTime,
      startGame,
      resetGame,
      fetchLanguages
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.matching-container {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.matching-container > h1 {
  color: white;
  font-size: 32px;
  margin-bottom: 30px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.setup-section {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  margin-bottom: 30px;
  width: 100%;
  max-width: 1000px;
}

.setup-section .form {
  background: transparent;
  padding: 0;
  border-radius: 0;
  margin-bottom: 20px;
}

.setup-section .fields {
  display: flex !important;
  gap: 20px !important;
  align-items: flex-end;
  flex-wrap: wrap;
}

.setup-section .field {
  flex: 1;
  min-width: 200px;
}

.setup-section .field:last-child {
  flex: 0 0 auto;
}

.setup-section select {
  width: 100% !important;
  padding: 12px !important;
  font-size: 14px !important;
  border: 2px solid #e8e8e8 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

.setup-section select:focus {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.setup-section label {
  font-size: 13px !important;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1000px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-item i {
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: white;
}

.game-board {
  margin-bottom: 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 1000px;
}

.language-headers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.language-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid #667eea;
  border-radius: 8px;
  color: #333;
}

.language-col i {
  font-size: 28px;
}

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.word-box {
  padding: 18px;
  background: #f8f9fb;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
}

.word-box:hover:not(.matched) {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea05 0%, #764ba205 100%);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
}

.word-box.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.word-box.matched {
  background: linear-gradient(135deg, #26de81 0%, #20c997 100%);
  color: white;
  border-color: #20c997;
  cursor: not-allowed;
  opacity: 0.9;
}

.game-result {
  text-align: center;
  padding: 50px 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 1000px;
}

.game-result h2 {
  font-size: 36px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.final-score {
  font-size: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  font-weight: bold;
}

.matches-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.ui.button {
  margin-right: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  border: none !important;
  padding: 12px 24px !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
}

.ui.button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4) !important;
}

.ui.primary.button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}
</style>
