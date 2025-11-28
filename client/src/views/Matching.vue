<template>
  <div class="matching-container">
    <h1>Word Matching Game</h1>
    
    <!-- Game Stats -->
    <div class="stats">
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
      <button @click="startNewGame" class="ui primary button">Play Again</button>
      <router-link to="/words" class="ui button">Back to Words</router-link>
    </div>

    <!-- Back button -->
    <div v-if="gameStatus !== 'finished'" style="margin-top: 20px;">
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
    
    const gameStatus = ref('loading');
    const selectedLeft = ref(null);
    const selectedRight = ref(null);
    const correctMatches = ref(0);
    const score = ref(0);
    const timeRemaining = ref(180);
    const matchedPairs = ref(new Set());
    const rightColumnShuffled = ref([]);
    let gameTimer = null;

    const leftColumn = computed(() => {
      return words.value.slice(0, Math.ceil(words.value.length / 2));
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
        
        const langResponse = await getActiveLanguages();
        if (langResponse && langResponse.languages) {
          availableLanguages.value = langResponse.languages;
        }

        const response = await viewAllWords();
        const wordList = response?.vocabs || response || [];
        
        const filteredWords = wordList
          .filter(word => 
            word.translations &&
            word.translations[language1.value] &&
            word.translations[language2.value]
          )
          .slice(0, 10);

        if (filteredWords.length >= 4) {
          words.value = filteredWords;
          const rightItems = filteredWords.slice(Math.ceil(filteredWords.length / 2));
          rightColumnShuffled.value = shuffleArray(rightItems);
          gameStatus.value = 'playing';
          startTimer();
        } else {
          gameStatus.value = 'finished';
        }
      } catch (error) {
        console.error('Error loading game:', error);
        gameStatus.value = 'finished';
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
      loadGame();
    });

    onUnmounted(() => {
      if (gameTimer) clearInterval(gameTimer);
    });

    return {
      words,
      availableLanguages,
      language1,
      language2,
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
      startNewGame
    };
  }
};
</script>

<style scoped>
.matching-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.stat-item i {
  font-size: 24px;
  color: #2196F3;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}

.game-board {
  margin-bottom: 30px;
}

.language-headers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.language-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.language-col i {
  font-size: 24px;
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
  padding: 15px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 16px;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.word-box:hover:not(.matched) {
  border-color: #2196F3;
  background: #f0f8ff;
  transform: translateY(-2px);
}

.word-box.selected {
  background: #2196F3;
  color: white;
  border-color: #1976D2;
}

.word-box.matched {
  background: #4CAF50;
  color: white;
  border-color: #388E3C;
  cursor: not-allowed;
  opacity: 0.8;
}

.game-result {
  text-align: center;
  padding: 50px;
  background: #f5f5f5;
  border-radius: 8px;
}

.game-result h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #333;
}

.final-score {
  font-size: 28px;
  color: #2196F3;
  margin-bottom: 10px;
  font-weight: bold;
}

.matches-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.ui.button {
  margin-right: 10px;
}
</style>
