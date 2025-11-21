<template>
  <div>
    <h1>New Word</h1>
    
    <form @submit.prevent="onSubmit">
      <!-- First language input -->
      <div class="ui labeled input fluid" style="margin-bottom: 15px;">
        <div 
          class="ui label language-selector"
          @click="openLanguageSelector(0)"
          style="cursor: pointer;"
          :title="'Click to change language'"
        >
          <i :class="`${getLanguageByCode(selectedLanguages[0]).flag} flag`"></i> 
          {{ getLanguageByCode(selectedLanguages[0]).name }}
          <i class="dropdown icon" style="margin-left: 5px;"></i>
        </div>
        <input 
          type="text" 
          required
          v-model="word.translations[selectedLanguages[0]]" 
          :placeholder="`Enter ${getLanguageByCode(selectedLanguages[0]).name} word`"
        />
      </div>
      
      <!-- Second language input -->
      <div class="ui labeled input fluid" style="margin-bottom: 15px;">
        <div 
          class="ui label language-selector"
          @click="openLanguageSelector(1)"
          style="cursor: pointer;"
          :title="'Click to change language'"
        >
          <i :class="`${getLanguageByCode(selectedLanguages[1]).flag} flag`"></i> 
          {{ getLanguageByCode(selectedLanguages[1]).name }}
          <i class="dropdown icon" style="margin-left: 5px;"></i>
        </div>
        <input 
          type="text" 
          required
          v-model="word.translations[selectedLanguages[1]]" 
          :placeholder="`Enter ${getLanguageByCode(selectedLanguages[1]).name} word`"
        />
      </div>
      
      <button class="ui primary button" type="submit">Submit</button>
    </form>

    <!-- Simple Language Dropdown -->
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

    <!-- Backdrop to close dropdown -->
    <div 
      v-if="showLanguageSelector" 
      class="dropdown-backdrop"
      @click="closeLanguageSelector"
    ></div>
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
.language-selector {
  transition: all 0.2s ease;
}

.language-selector:hover {
  background-color: #e0e1e2 !important;
  transform: scale(1.02);
}

/* Simple dropdown instead of modal */
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
