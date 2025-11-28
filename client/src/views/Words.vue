<template>
  <div>
    <h1>Word List</h1>
    
    <!-- Language Selection Dropdowns -->
    <div class="ui form" style="margin-bottom: 20px;">
      <div class="two fields">
        <div class="field">
          <label>Column 1 Language</label>
          <select v-model="selectedLanguage1" class="ui dropdown">
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>Column 2 Language</label>
          <select v-model="selectedLanguage2" class="ui dropdown">
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Words Table -->
    <table class="ui celled compact table">
      <thead>
        <tr>
          <th>
            <i :class="`${getLanguageFlag(selectedLanguage1)} flag`"></i>
            {{ getLanguageName(selectedLanguage1) }}
          </th>
          <th>
            <i :class="`${getLanguageFlag(selectedLanguage2)} flag`"></i>
            {{ getLanguageName(selectedLanguage2) }}
          </th>
          <th>Created At</th>
          <th colspan="3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(word, index) in words" :key="index">
          <td>{{ getTranslation(word, selectedLanguage1) }}</td>
          <td>{{ getTranslation(word, selectedLanguage2) }}</td>
          <td>{{ formatDate(word.createdAt) }}</td>
          <td width="75">
            <router-link
              class="ui button green"
              :to="{ name: 'Show', params: { id: word._id } }"
              >Show</router-link
            >
          </td>
          <td width="75">
            <router-link
              class="ui button yellow"
              :to="{ name: 'Edit', params: { id: word._id } }"
              >Edit</router-link
            >
          </td>
          <td width="75">
            <a @click.prevent="onDelete(word._id)" class="ui red button"
              >Delete</a
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { viewAllWords, deleteWord, getActiveLanguages } from "../helpers/api";

export default {
  name: "Words",
  setup() {
    const words = ref([]);
    const availableLanguages = ref([]);
    const selectedLanguage1 = ref('en');
    const selectedLanguage2 = ref('vi');

    // Get available languages
    const fetchLanguages = async () => {
      try {
        const response = await getActiveLanguages();
        if (response && response.languages) {
          // Sort languages by name to ensure consistent order
          availableLanguages.value = response.languages.sort((a, b) => a.name.localeCompare(b.name));
          // Always set default selections to English + Vietnamese
          selectedLanguage1.value = 'en';
          selectedLanguage2.value = 'vi';
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages
        availableLanguages.value = [
          { code: 'en', name: 'English', flag: 'us' },
          { code: 'vi', name: 'Vietnamese', flag: 'vn' }
        ];
      }
    };

    // Get language name by code
    const getLanguageName = (langCode) => {
      const lang = availableLanguages.value.find(l => l.code === langCode);
      return lang ? lang.name : langCode.toUpperCase();
    };

    // Get language flag by code
    const getLanguageFlag = (langCode) => {
      const lang = availableLanguages.value.find(l => l.code === langCode);
      return lang ? `${lang.flag} flag` : '';
    };

    // Get translation for specific language
    const getTranslation = (word, languageCode) => {
      // Use new format (translations object)
      if (word.translations && typeof word.translations === 'object') {
        return word.translations[languageCode] || '';
      }
      return '';
    };

    onMounted(async () => {
      console.log('Words component mounted');
      await fetchLanguages();
      console.log('Languages fetched:', availableLanguages.value.length);
      console.log('Available languages:', availableLanguages.value);
      console.log('Selected language 1:', selectedLanguage1.value);
      console.log('Selected language 2:', selectedLanguage2.value);
      
      try {
        const response = await viewAllWords();
        console.log('Full response:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', Object.keys(response || {}));
        words.value = response?.vocabs || response || [];
        console.log('Words loaded:', words.value);
        console.log('Words count:', words.value.length);
      } catch (error) {
        console.error('Error loading words:', error);
      }
    });

    const onDelete = async (id) => {
      const deleteConfirm = window.confirm("Are you sure to delete this word?");
      if (deleteConfirm) {
        await deleteWord(id);
        words.value = words.value.filter((word) => word._id !== id);
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    return {
      words,
      availableLanguages,
      selectedLanguage1,
      selectedLanguage2,
      getTranslation,
      getLanguageName,
      getLanguageFlag,
      onDelete,
      formatDate
    };
  },
};
</script>
