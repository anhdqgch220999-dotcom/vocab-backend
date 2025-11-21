<template>
<div>
    <h1>Language Management</h1>
    
    <!-- Add New Language Form -->
    <div class="ui segment">
    <h3>Add New Language</h3>
    <form class="ui form" @submit.prevent="addLanguage">
        <div class="three fields">
        <div class="field">
            <label>Language Code</label>
            <input 
            type="text" 
            v-model="newLanguage.code" 
            placeholder="e.g. fr, es, ja"
            maxlength="2"
            required
            />
        </div>
        <div class="field">
            <label>Language Name</label>
            <input 
            type="text" 
            v-model="newLanguage.name" 
            placeholder="e.g. French, Spanish, Japanese"
            required
            />
        </div>
        <div class="field">
            <label>Flag Code</label>
            <input 
            type="text" 
            v-model="newLanguage.flag" 
            placeholder="e.g. fr, es, jp"
            maxlength="2"
            required
            />
        </div>
        </div>
        <button class="ui primary button" type="submit">
        <i class="plus icon"></i>Add Language
        </button>
    </form>
    </div>

    <!-- Languages Table -->
    <div class="ui segment">
    <h3>All Languages</h3>
    <table class="ui celled table">
        <thead>
        <tr>
            <th>Flag</th>
            <th>Code</th>
            <th>Name</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="language in languages" :key="language._id">
            <td>
            <i :class="`${language.flag} flag`"></i>
            </td>
            <td>{{ language.code }}</td>
            <td>{{ language.name }}</td>
            <td>
            <div class="ui label" :class="language.isActive ? 'green' : 'grey'">
                {{ language.isActive ? 'Active' : 'Inactive' }}
            </div>
            </td>
            <td>{{ formatDate(language.createdAt) }}</td>
            <td>
            <button 
                class="ui button"
                :class="language.isActive ? 'red' : 'green'"
                @click="toggleLanguageStatus(language._id, !language.isActive)"
            >
                {{ language.isActive ? 'Deactivate' : 'Activate' }}
            </button>
            <button 
                class="ui red button"
                @click="deleteLanguage(language._id)"
                :disabled="language.code === 'en'"
            >
                Delete
            </button>
            </td>
        </tr>
        </tbody>
    </table>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="ui message" :class="messageType">
    {{ message }}
    </div>
</div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getAllLanguages, addNewLanguage, updateLanguageStatus, deleteLanguageById } from '../helpers/api';

export default {
name: 'AdminLanguages',
setup() {
    const languages = ref([]);
    const newLanguage = ref({
    code: '',
    name: '',
    flag: ''
    });
    const message = ref('');
    const messageType = ref('success');

    // Fetch all languages
    const fetchLanguages = async () => {
    try {
        const response = await getAllLanguages();
        if (response && response.success) {
        languages.value = response.languages;
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
        showMessage('Error fetching languages', 'error');
    }
    };

    // Add new language
    const addLanguage = async () => {
    try {
        // Validate input
        if (!newLanguage.value.code || !newLanguage.value.name || !newLanguage.value.flag) {
        showMessage('Please fill all fields', 'error');
        return;
        }

        // Check if language code already exists
        const existingLanguage = languages.value.find(lang => lang.code === newLanguage.value.code.toLowerCase());
        if (existingLanguage) {
        showMessage('Language code already exists', 'error');
        return;
        }

        const response = await addNewLanguage({
        code: newLanguage.value.code.toLowerCase(),
        name: newLanguage.value.name,
        flag: newLanguage.value.flag.toLowerCase()
        });

        if (response && response.success) {
        showMessage('Language added successfully', 'success');
        newLanguage.value = { code: '', name: '', flag: '' };
        await fetchLanguages();
        } else {
        showMessage('Error adding language', 'error');
        }
    } catch (error) {
        console.error('Error adding language:', error);
        showMessage('Error adding language', 'error');
    }
    };

    // Toggle language status
    const toggleLanguageStatus = async (languageId, isActive) => {
    try {
        const response = await updateLanguageStatus(languageId, isActive);
        if (response && response.success) {
        showMessage(`Language ${isActive ? 'activated' : 'deactivated'} successfully`, 'success');
        await fetchLanguages();
        } else {
        showMessage('Error updating language status', 'error');
        }
    } catch (error) {
        console.error('Error updating language status:', error);
        showMessage('Error updating language status', 'error');
    }
    };

    // Delete language
    const deleteLanguage = async (languageId) => {
    if (!confirm('Are you sure you want to delete this language?')) {
        return;
    }

    try {
        const response = await deleteLanguageById(languageId);
        if (response && response.success) {
        showMessage('Language deleted successfully', 'success');
        await fetchLanguages();
        } else {
        showMessage('Error deleting language', 'error');
        }
    } catch (error) {
        console.error('Error deleting language:', error);
        showMessage('Error deleting language', 'error');
    }
    };

    // Show message
    const showMessage = (msg, type) => {
    message.value = msg;
    messageType.value = type;
    setTimeout(() => {
        message.value = '';
    }, 3000);
    };

    // Format date
    const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
    };

    onMounted(() => {
    fetchLanguages();
    });

    return {
    languages,
    newLanguage,
    message,
    messageType,
    addLanguage,
    toggleLanguageStatus,
    deleteLanguage,
    formatDate
    };
}
};
</script>

<style scoped>
.ui.form .field input {
text-transform: lowercase;
}

.ui.message {
margin-top: 20px;
}
</style>
