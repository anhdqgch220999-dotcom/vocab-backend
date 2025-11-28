<template>
    <div>
        <h1>Show Word</h1>
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
            <input type="text" disabled :value="getTranslation(word, lang.code)" />
        </div>
        
        <div>
            <router-link :to="{ name: 'Edit', params: { id: route.params.id } }" class="ui yellow button">
                Edit word
            </router-link>
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
