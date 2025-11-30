<template>
  <div class="edit-page">
    <div class="page-container">
      <h1>Edit Word</h1>
      <form @submit.prevent="onSubmit" class="word-form">
        <div 
          v-for="lang in usedLanguages" 
          :key="lang.code"
          class="form-group"
        >
          <label class="form-label">
            <i :class="`${lang.flag} flag`"></i>
            {{ lang.name }}
          </label>
          <input 
            type="text" 
            required 
            v-model="word.translations[lang.code]"
            class="form-input"
          />
        </div>
        
        <button class="ui primary button">Submit</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { viewWordById, editWord, getActiveLanguages } from "../helpers/api";

export default {
  name: "Edit",
  setup() {
    const word = ref({
      translations: {}
    });
    const route = useRoute();
    const router = useRouter();
    const availableLanguages = ref([]);

    // Get available languages
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
          { code: 'de', name: 'German', flag: 'de' }
        ];
      }
    };

    // Determine languages to show for editing
    const usedLanguages = computed(() => {
      if (!word.value || !word.value.usedLanguages) {
        return availableLanguages.value.slice(0, 2); // Default: first 2 languages
      }

      // Use saved usedLanguages from the word
      return word.value.usedLanguages
        .map(code => availableLanguages.value.find(lang => lang.code === code))
        .filter(Boolean); // Remove undefined values
    });    // Initialize word data for editing
    const initializeWordData = (wordData) => {
      const translations = {};
      
      // Use saved usedLanguages to determine which fields to show
      const languagesToShow = wordData.usedLanguages && Array.isArray(wordData.usedLanguages) 
        ? wordData.usedLanguages 
        : ['en', 'de']; // fallback
      
      // Initialize translations for ALL languages in usedLanguages (even if empty)
      languagesToShow.forEach(langCode => {
        if (wordData.translations && wordData.translations[langCode]) {
          // New format
          translations[langCode] = wordData.translations[langCode];
        } else {
          // Empty field for languages that don't have content yet
          translations[langCode] = '';
        }
      });
      
      return {
        ...wordData,
        translations
      };
    };

    onMounted(async () => {
      await fetchLanguages();
      const result = await viewWordById(route.params.id);
      if (result) {
        word.value = initializeWordData(result);
      } else {
        alert("Failed to load word data.");
        word.value = { translations: {} };
      }
    });

    const onSubmit = async () => {
      try {
        const wordData = {
          translations: { ...word.value.translations },
          sourceLanguage: word.value.sourceLanguage || 'en',
          definition: word.value.definition || '',
          example: word.value.example || '',
          usedLanguages: usedLanguages.value.map(lang => lang.code)
        };
        
        const result = await editWord(route.params.id, wordData);
        
        if (result) {
          router.push('/words');
        } else {
          alert("Failed to update word. Please try again.");
        }
      } catch (error) {
        console.error('Error updating word:', error);
        alert('Error updating word. Please try again.');
      }
    };

    return {
      word,
      availableLanguages,
      usedLanguages,
      onSubmit
    };
  }
};
</script>

<style scoped>
.edit-page {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 40px 20px;
}

.page-container {
  max-width: 600px;
  margin: 0 auto;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #f59e0b;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.ui.primary.button {
  align-self: flex-start;
  margin-top: 10px;
}
</style>