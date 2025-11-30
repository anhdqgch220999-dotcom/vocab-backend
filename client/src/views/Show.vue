<template>
    <div class="show-container">
      <div class="show-header">
        <h1>📖 Word Details</h1>
        <p>View all translations for this word</p>
      </div>

      <div class="word-details-card">
        <div 
            v-for="lang in usedLanguages" 
            :key="lang.code"
            class="translation-field"
        >
            <div class="field-label">
                <i :class="`${lang.flag} flag`"></i>
                <span>{{ lang.name }}</span>
            </div>
            <input 
              type="text" 
              class="translation-input"
              disabled 
              :value="getTranslation(word, lang.code)" 
            />
        </div>
        
        <div class="actions">
            <router-link 
              :to="{ name: 'Edit', params: { id: route.params.id } }" 
              class="btn-action btn-edit"
            >
                <i class="edit icon"></i> Edit Word
            </router-link>
            <router-link to="/words" class="btn-action btn-back">
                <i class="arrow left icon"></i> Back to Words
            </router-link>
        </div>
      </div>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute } from 'vue-router';
import { viewWordById, getActiveLanguages } from "../helpers/api.js";

export default {
    name: "Show",
    setup() {
        const word = ref("");
        const route = useRoute();
        const availableLanguages = ref([]);

        // Get available languages
        const fetchLanguages = async () => {
            try {
                const response = await getActiveLanguages();
                if (response && response.languages) {
                    availableLanguages.value = response.languages;
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

        // Smart detection of used languages for this word
        const usedLanguages = computed(() => {
            if (!word.value || Object.keys(word.value).length === 0) {
                // Default: English + Vietnamese
                return availableLanguages.value.filter(lang => lang.code === 'en' || lang.code === 'vn').slice(0, 2);
            }

            const languageCodes = new Set();

            // Prioritize using saved usedLanguages
            if (word.value.usedLanguages && Array.isArray(word.value.usedLanguages)) {
                word.value.usedLanguages.forEach(langCode => {
                    languageCodes.add(langCode);
                });
            } else {
                // Fallback: Check new format (translations object)
                if (word.value.translations && typeof word.value.translations === 'object') {
                    Object.keys(word.value.translations).forEach(langCode => {
                        if (word.value.translations[langCode] && word.value.translations[langCode].trim() !== '') {
                            languageCodes.add(langCode);
                        }
                    });
                }
            }

            // Convert to language objects and sort
            const usedLangs = Array.from(languageCodes)
                .map(code => availableLanguages.value.find(lang => lang.code === code))
                .filter(Boolean) // Remove undefined values
                .sort((a, b) => a.name.localeCompare(b.name));

            // Ensure we have at least English + Vietnamese if no languages detected
            if (usedLangs.length === 0) {
                const defaultLangs = availableLanguages.value.filter(lang => lang.code === 'en' || lang.code === 'vn');
                return defaultLangs.length > 0 ? defaultLangs : availableLanguages.value.slice(0, 2);
            }

            return usedLangs;
        });

        // Get translation for specific language
        const getTranslation = (word, languageCode) => {
            // Use new format (translations object)
            if (word.translations && typeof word.translations === 'object') {
                return word.translations[languageCode] || '';
            }
            
            return '';
        };

        onMounted(async () => {
            await fetchLanguages();
            word.value = await viewWordById(route.params.id) || "";
        });

        return {
            word,
            route,
            availableLanguages,
            usedLanguages,
            getTranslation
        };
    }
};
</script>

<style scoped>
.show-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #2dd4bf;
  animation: slideUp 0.6s ease-out;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.show-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.show-header h1 {
  font-size: 36px;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.show-header p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.word-details-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.translation-field {
  margin-bottom: 25px;
}

.translation-field:last-of-type {
  margin-bottom: 35px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #2dd4bf;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.field-label i {
  font-size: 20px;
}

.translation-input {
  width: 100%;
  padding: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  color: #374151;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.translation-input:focus {
  outline: none;
  border-color: #f59e0b;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.translation-input:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  opacity: 0.8;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 35px;
  padding-top: 25px;
  border-top: 2px solid #e5e7eb;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border: none;
  white-space: nowrap;
  flex: 1;
  justify-content: center;
}

.btn-action i {
  font-size: 16px;
}

.btn-edit {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-back {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 114, 128, 0.4);
}
</style>