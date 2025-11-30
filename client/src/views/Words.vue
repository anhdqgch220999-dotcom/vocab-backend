<template>
  <div class="words-container">
    <div class="words-header">
      <h1>📚 Word List</h1>
      <p>Manage and practice your vocabulary</p>
    </div>
    
    <!-- Language Selection Dropdowns -->
    <div class="language-selector">
      <div class="lang-field">
        <label>Column 1 Language</label>
        <div class="select-wrapper">
          <i class="flag icon"></i>
          <select v-model="selectedLanguage1" class="ui dropdown compact">
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="lang-field">
        <label>Column 2 Language</label>
        <div class="select-wrapper">
          <i class="flag icon"></i>
          <select v-model="selectedLanguage2" class="ui dropdown compact">
            <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
              {{ lang.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Words Table -->
    <div class="table-container">
      <table class="words-table">
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
            <th>📅 Created At</th>
            <th colspan="3">⚙️ Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(word, index) in words" :key="index" class="word-row">
            <td>{{ getTranslation(word, selectedLanguage1) }}</td>
            <td>{{ getTranslation(word, selectedLanguage2) }}</td>
            <td>{{ formatDate(word.createdAt) }}</td>
            <td width="75">
              <router-link
                class="btn-action btn-show"
                :to="{ name: 'Show', params: { id: word._id } }"
              >
                <i class="eye icon"></i> Show
              </router-link>
            </td>
            <td width="75">
              <router-link
                class="btn-action btn-edit"
                :to="{ name: 'Edit', params: { id: word._id } }"
              >
                <i class="edit icon"></i> Edit
              </router-link>
            </td>
            <td width="75">
              <a @click.prevent="onDelete(word._id)" class="btn-action btn-delete">
                <i class="trash icon"></i> Delete
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
    const selectedLanguage2 = ref('vn');

    // Get available languages
    const fetchLanguages = async () => {
      try {
        const response = await getActiveLanguages();
        if (response && response.languages) {
          // Sort languages by name to ensure consistent order
          availableLanguages.value = response.languages.sort((a, b) => a.name.localeCompare(b.name));
          // Always set default selections to English + Vietnamese
          selectedLanguage1.value = 'en';
          selectedLanguage2.value = 'vn';
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        // Fallback to default languages
        availableLanguages.value = [
          { code: 'en', name: 'English', flag: 'us' },
          { code: 'vn', name: 'Vietnamese', flag: 'vn' }
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

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.words-container {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #6ee7b7 0%, #2dd4bf 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
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

.words-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  width: 100%;
  max-width: 1200px;
}

.words-header h1 {
  font-size: 36px;
  color: #1f2937;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.words-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.language-selector {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  align-items: flex-end;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
}

.lang-field {
  flex: 0 0 auto;
  min-width: 200px;
}

.lang-field label {
  font-size: 13px !important;
  font-weight: 600;
  display: block;
  margin-bottom: 10px;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.select-wrapper:focus-within {
  border-color: #2dd4bf;
  background: white;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

.select-wrapper i {
  padding: 0 12px;
  color: #2dd4bf;
  font-size: 16px;
}

.select-wrapper select {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0 12px 0;
  font-size: 14px;
  outline: none;
  color: #1f2937;
  font-family: inherit;
  cursor: pointer;
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
}

.words-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.words-table thead {
  background: linear-gradient(135deg, #6ee7b7 0%, #2dd4bf 100%);
  color: white;
}

.words-table thead th {
  padding: 18px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.words-table th i {
  margin-right: 8px;
  font-size: 16px;
}

.words-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.words-table tbody tr:hover {
  background: #f9fafb;
}

.words-table tbody td {
  padding: 16px 18px;
  color: #374151;
  vertical-align: middle;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: none;
  white-space: nowrap;
}

.btn-action i {
  font-size: 14px;
}

.btn-show {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.btn-show:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.btn-edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 158, 11, 0.4);
}

.btn-delete {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(239, 68, 68, 0.4);
}
</style>
