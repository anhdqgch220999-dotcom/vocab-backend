<template>
  <div>
    <h1>Edit Word</h1>
    <form action="" @submit.prevent="onSubmit">
      <div 
        v-for="lang in usedLanguages" 
        :key="lang.code"
        class="ui labeled input fluid" 
        style="margin-bottom: 15px;"
      >
        <div class="ui label">
          <i :class="`${lang.flag} flag`"></i> 
          {{ lang.name }}
        </div>
        <input 
          type="text" 
          required 
          v-model="word.translations[lang.code]"
        />
      </div>
      
      <button class="ui primary button">Submit</button>
    </form>
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
