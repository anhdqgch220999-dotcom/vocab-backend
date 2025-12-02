<template>
  <div class="admin-users-container">
    <!-- Header -->
    <div class="admin-header">
      <h1>👥 User Management</h1>
      <p class="subtitle">View and manage user accounts and roles</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid" v-if="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalUsers }}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.adminUsers }}</div>
        <div class="stat-label">Admin Users</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalVocabs }}</div>
        <div class="stat-label">Total Vocabs</div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="content-card">
      <h3 class="card-title">All Users</h3>
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" :class="user.role === 'admin' ? 'admin' : 'user'">
                  {{ user.role }}
                </span>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="action-buttons">
                <button 
                  class="btn-sm btn-edit" 
                  @click="editUser(user)"
                  :disabled="user._id === currentUserId"
                >
                  <i class="edit icon"></i>Edit
                </button>
                <button 
                  class="btn-sm btn-danger" 
                  @click="deleteUser(user)"
                  :disabled="user._id === currentUserId"
                >
                  <i class="trash icon"></i>Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" v-if="showEditModal" @click="cancelEdit"></div>
    <div class="modal-dialog" v-if="editingUser && showEditModal">
      <div class="modal-header">
        <h2>Edit User</h2>
      </div>
      <div class="modal-content">
        <form class="edit-form">
          <div class="form-row">
            <div class="form-field">
              <label>First Name</label>
              <input type="text" v-model="editingUser.firstName" required>
            </div>
            <div class="form-field">
              <label>Last Name</label>
              <input type="text" v-model="editingUser.lastName" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Username</label>
              <input type="text" v-model="editingUser.username" required>
            </div>
            <div class="form-field">
              <label>Email</label>
              <input type="email" v-model="editingUser.email" required>
            </div>
          </div>
          <div class="form-field">
            <label>Role</label>
            <select v-model="editingUser.role" class="role-select">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" @click="cancelEdit">Cancel</button>
        <button class="btn-primary" @click="saveUser">Save</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { api } from '../helpers/api';
import { authStore } from '../helpers/auth';

export default {
  name: "AdminUsers",
  setup() {
    const users = ref([]);
    const stats = ref(null);
    const editingUser = ref(null);
    const showEditModal = ref(false);
    const currentUserId = ref(authStore.user?.id);

    // Load data
    const loadUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        if (response.success) {
          users.value = response.users;
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    const loadStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.success) {
          stats.value = response.stats;
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    // Edit user
    const editUser = (user) => {
      editingUser.value = { ...user };
      showEditModal.value = true;
    };

    const saveUser = async () => {
      try {
        const response = await api.put(`/admin/users/${editingUser.value._id}`, editingUser.value);
        if (response.success) {
          await loadUsers();
          showEditModal.value = false;
          editingUser.value = null;
        }
      } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user: ' + (error.message || 'Unknown error'));
      }
    };

    const cancelEdit = () => {
      showEditModal.value = false;
      editingUser.value = null;
    };

    // Delete user
    const deleteUser = async (user) => {
      if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}? This will also delete all their vocabs.`)) {
        try {
          const response = await api.delete(`/admin/users/${user._id}`);
          if (response.success) {
            await loadUsers();
            await loadStats();
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Error deleting user: ' + (error.message || 'Unknown error'));
        }
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    onMounted(() => {
      loadUsers();
      loadStats();
    });

    return {
      users,
      stats,
      editingUser,
      showEditModal,
      currentUserId,
      editUser,
      saveUser,
      cancelEdit,
      deleteUser,
      formatDate
    };
  }
};
</script>

<style scoped>
.admin-users-container {
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

.stats-grid {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  animation: slideUp 0.6s ease-out;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.95rem;
  color: #6b7280;
  margin-top: 10px;
  font-weight: 500;
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

.role-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-badge.admin {
  background-color: #fee2e2;
  color: #991b1b;
}

.role-badge.user {
  background-color: #dbeafe;
  color: #1e40af;
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

.btn-edit {
  background-color: #fbbf24;
  color: #78350f;
}

.btn-edit:hover:not(:disabled) {
  background-color: #f59e0b;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  padding: 25px 30px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-content {
  padding: 25px 30px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-field input,
.role-select {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-field input:focus,
.role-select:focus {
  outline: none;
  border-color: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

.modal-actions {
  padding: 20px 30px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 212, 191, 0.4);
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .admin-users-container {
    padding: 20px 10px;
  }

  .admin-header h1 {
    font-size: 1.75rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
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

  .modal-dialog {
    width: 95%;
  }
}
</style>
