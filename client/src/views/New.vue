<template>
  <div class="new-page">
    <div class="page-container">
      <h1>New Word</h1>
      
      <form @submit.prevent="onSubmit" class="word-form">
        <!-- First language input -->
        <div class="form-group">
          <label class="form-label">Language 1</label>
          <div class="input-group">
            <div 
              class="language-label"
              @click="openLanguageSelector(0)"
              style="cursor: pointer;"
            >
              <i :class="`${getLanguageByCode(selectedLanguages[0]).flag} flag`"></i> 
              {{ getLanguageByCode(selectedLanguages[0]).name }}
              <i class="dropdown icon"></i>
            </div>
            <input 
              type="text" 
              required
              v-model="word.translations[selectedLanguages[0]]" 
              :placeholder="`Enter ${getLanguageByCode(selectedLanguages[0]).name} word`"
              class="form-input"
            />
          </div>
        </div>
        
        <!-- Second language input -->
        <div class="form-group">
          <label class="form-label">Language 2</label>
          <div class="input-group">
            <div 
              class="language-label"
              @click="openLanguageSelector(1)"
              style="cursor: pointer;"
            >
              <i :class="`${getLanguageByCode(selectedLanguages[1]).flag} flag`"></i> 
              {{ getLanguageByCode(selectedLanguages[1]).name }}
              <i class="dropdown icon"></i>
            </div>
            <input 
              type="text" 
              required
              v-model="word.translations[selectedLanguages[1]]" 
              :placeholder="`Enter ${getLanguageByCode(selectedLanguages[1]).name} word`"
              class="form-input"
            />
          </div>
        </div>
        
        <button class="ui primary button" type="submit">Submit</button>
      </form>

      <!-- Language Dropdown -->
      <div 
        v-if="showLanguageSelector" 
        class="language-dropdown"
        @click.stop
      >
        <div class="dropdown-content">
          <div class="dropdown-header">Choose Language</div>
          <div 
            v-for="language in availableLanguages" 
            :key="language.code"
            class="dropdown-item"
            @click="selectLanguage(language.code)"
            :class="{ 'disabled': isLanguageAlreadySelected(language.code) }"
          >
            <i :class="`${language.flag} flag`"></i>
            {{ language.name }}
            <span v-if="isLanguageAlreadySelected(language.code)" class="already-selected">✓</span>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div 
        v-if="showLanguageSelector" 
        class="dropdown-backdrop"
        @click="closeLanguageSelector"
      ></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { addNewWord, getActiveLanguages } from "../helpers/api";

export default {
  name: "New",
  setup() {
    const word = ref({
      translations: {},
      definition: '',
      example: '',
      sourceLanguage: 'en'
    });
    const router = useRouter();
    const availableLanguages = ref([]);
    const selectedLanguages = ref(['en', 'de']); // Always exactly 2 languages
    const showLanguageSelector = ref(false);
    const currentEditingIndex = ref(0);

    // Initialize default translations
    word.value.translations = {
      en: '',
      de: ''
    };

    // Fetch available languages
    const fetchLanguages = async () => {
      try {
        const response = await getActiveLanguages();
        if (response && response.success) {
          availableLanguages.value = response.languages;
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages
        availableLanguages.value = [
          { code: 'en', name: 'English', flag: 'us' },
          { code: 'de', name: 'German', flag: 'de' },
          { code: 'vi', name: 'Vietnamese', flag: 'vn' },
          { code: 'fr', name: 'French', flag: 'fr' },
          { code: 'es', name: 'Spanish', flag: 'es' },
          { code: 'it', name: 'Italian', flag: 'it' },
          { code: 'pt', name: 'Portuguese', flag: 'pt' },
          { code: 'ja', name: 'Japanese', flag: 'jp' },
          { code: 'ko', name: 'Korean', flag: 'kr' },
          { code: 'zh', name: 'Chinese', flag: 'cn' }
        ];
      }
    };

    // Get language object by code
    const getLanguageByCode = (code) => {
      return availableLanguages.value.find(lang => lang.code === code) || 
             { code, name: code.toUpperCase(), flag: 'us' };
    };

    // Open language selector for specific field (0 or 1)
    const openLanguageSelector = (index) => {
      currentEditingIndex.value = index;
      showLanguageSelector.value = true;
    };

    // Close language selector
    const closeLanguageSelector = () => {
      showLanguageSelector.value = false;
    };

    // Select a language (replace current language in specific field)
    const selectLanguage = (languageCode) => {
      if (isLanguageAlreadySelected(languageCode)) {
        return; // Don't allow duplicate languages
      }

      const oldLangCode = selectedLanguages.value[currentEditingIndex.value];
      const oldValue = word.value.translations[oldLangCode] || '';
      
      // Remove old language data
      delete word.value.translations[oldLangCode];
      
      // Add new language
      selectedLanguages.value[currentEditingIndex.value] = languageCode;
      word.value.translations[languageCode] = oldValue; // Keep the text if any
      
      closeLanguageSelector();
    };

    // Check if language is already selected
    const isLanguageAlreadySelected = (languageCode) => {
      return selectedLanguages.value.includes(languageCode);
    };

    const onSubmit = async () => {
      try {
        const wordData = {
          translations: { ...word.value.translations },
          sourceLanguage: word.value.sourceLanguage,
          definition: word.value.definition,
          example: word.value.example,
          usedLanguages: selectedLanguages.value
        };
        
        const result = await addNewWord(wordData);
        if (result) {
          router.push('/words');
        } else {
          alert('Error adding word. Please try again.');
        }
      } catch (error) {
        console.error('Error adding word:', error);
        alert('Error adding word. Please try again.');
      }
    };

    onMounted(() => {
      fetchLanguages();
    });

    return {
      word,
      availableLanguages,
      selectedLanguages,
      showLanguageSelector,
      currentEditingIndex,
      getLanguageByCode,
      openLanguageSelector,
      closeLanguageSelector,
      selectLanguage,
      isLanguageAlreadySelected,
      onSubmit
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

.new-page {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.page-container {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.word-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-group {
  display: flex;
  gap: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

.language-label {
  background: #f3f4f6;
  padding: 12px 15px;
  border-right: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
}

.language-label:hover {
  background: #e5e7eb;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 15px;
  font-size: 14px;
  outline: none;
  color: #1f2937;
}

.form-input::placeholder {
  color: #9ca3af;
}

.ui.primary.button {
  align-self: flex-start;
  margin-top: 10px;
}

.language-selector {
  transition: all 0.2s ease;
}

.language-selector:hover {
  background-color: #e0e1e2 !important;
  transform: scale(1.02);
}

.language-dropdown {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  max-height: 400px;
  overflow-y: auto;
  min-width: 250px;
}

.dropdown-content {
  padding: 0;
}

.dropdown-header {
  padding: 15px 20px;
  background: #f8f9fa;
  font-weight: bold;
  border-bottom: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
}

.dropdown-item {
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover:not(.disabled) {
  background-color: #f8f9fa;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f5f5f5;
}

.dropdown-item i {
  margin-right: 10px;
}

.already-selected {
  color: #28a745;
  font-weight: bold;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  background-color: rgba(0,0,0,0.3);
}
</style>
