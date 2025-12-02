<template>
  <div class="admin-languages-container">
    <!-- Header -->
    <div class="admin-header">
      <h1>📚 Language Management</h1>
      <p class="subtitle">Manage languages and their settings</p>
    </div>

    <!-- Add New Language Form -->
    <div class="content-card">
      <h3 class="card-title">Add New Language</h3>
      <form class="language-form" @submit.prevent="addLanguage">
        <div class="form-row">
          <div class="form-field">
            <label>Language Code</label>
            <input 
              type="text" 
              v-model="newLanguage.code" 
              placeholder="e.g. fr, es, ja"
              maxlength="2"
              required
            />
          </div>
          <div class="form-field">
            <label>Language Name</label>
            <input 
              type="text" 
              v-model="newLanguage.name" 
              placeholder="e.g. French, Spanish, Japanese"
              required
            />
          </div>
          <div class="form-field">
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
        <button class="btn-primary" type="submit">
          <i class="plus icon"></i>Add Language
        </button>
      </form>
    </div>

    <!-- Languages Table -->
    <div class="content-card">
      <h3 class="card-title">All Languages</h3>
      <div class="table-wrapper">
        <table class="data-table">
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
                <span class="status-badge" :class="language.isActive ? 'active' : 'inactive'">
                  {{ language.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(language.createdAt) }}</td>
              <td class="action-buttons">
                <button 
                  class="btn-sm btn-toggle"
                  :class="language.isActive ? 'btn-danger' : 'btn-success'"
                  @click="toggleLanguageStatus(language._id, !language.isActive)"
                >
                  {{ language.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button 
                  class="btn-sm btn-danger"
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
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="message-alert" :class="messageType">
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
.admin-languages-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.admin-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  animation: slideDown 0.6s ease-out;
}

.admin-header h1 {
  font-size: 2.5rem;
  margin: 0;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin-top: 10px;
}

.content-card {
  max-width: 1200px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  animation: slideUp 0.6s ease-out;
}

.card-title {
  font-size: 1.5rem;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.language-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 12px;
  font-weight: 700;
  color: #2dd4bf;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-field input {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  transition: all 0.3s ease;
  text-transform: lowercase;
}

.form-field input:focus {
  border-color: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

.btn-primary {
  align-self: flex-start;
  padding: 12px 24px;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(45, 212, 191, 0.3);
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.data-table thead tr {
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  color: white;
}

.data-table thead th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: #f9fafb;
}

.data-table td {
  padding: 14px 16px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #f3f4f6;
  color: #6b7280;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-sm {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.btn-sm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-alert {
  max-width: 1200px;
  margin: 20px auto;
  padding: 16px 20px;
  border-radius: 8px;
  font-weight: 500;
  animation: slideUp 0.3s ease-out;
}

.message-alert.success {
  background-color: #d1fae5;
  color: #065f46;
  border-left: 4px solid #10b981;
}

.message-alert.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .admin-languages-container {
    padding: 20px 10px;
  }

  .admin-header h1 {
    font-size: 1.75rem;
  }

  .content-card {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-sm {
    width: 100%;
    justify-content: center;
  }
}
</style>
