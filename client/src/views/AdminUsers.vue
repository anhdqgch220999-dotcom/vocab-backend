<template>
  <div>
    <h1><i class="users icon"></i>User Management</h1>
    
    <!-- Stats Cards -->
    <div class="ui three stackable cards" v-if="stats">
      <div class="card">
        <div class="content">
          <div class="header">{{ stats.totalUsers }}</div>
          <div class="description">Total Users</div>
        </div>
      </div>
      <div class="card">
        <div class="content">
          <div class="header">{{ stats.adminUsers }}</div>
          <div class="description">Admin Users</div>
        </div>
      </div>
      <div class="card">
        <div class="content">
          <div class="header">{{ stats.totalVocabs }}</div>
          <div class="description">Total Vocabs</div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="ui segment">
      <h3>All Users</h3>
      <table class="ui celled table">
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
              <div class="ui label" :class="user.role === 'admin' ? 'red' : 'blue'">
                {{ user.role }}
              </div>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <button 
                class="ui small yellow button" 
                @click="editUser(user)"
                :disabled="user._id === currentUserId"
              >
                <i class="edit icon"></i>Edit
              </button>
              <button 
                class="ui small red button" 
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

    <!-- Edit User Modal -->
    <div class="ui modal" :class="{ 'visible active': showEditModal }" v-if="editingUser && showEditModal">
      <div class="header">Edit User</div>
      <div class="content">
        <form class="ui form">
          <div class="two fields">
            <div class="field">
              <label>First Name</label>
              <input type="text" v-model="editingUser.firstName" required>
            </div>
            <div class="field">
              <label>Last Name</label>
              <input type="text" v-model="editingUser.lastName" required>
            </div>
          </div>
          <div class="two fields">
            <div class="field">
              <label>Username</label>
              <input type="text" v-model="editingUser.username" required>
            </div>
            <div class="field">
              <label>Email</label>
              <input type="email" v-model="editingUser.email" required>
            </div>
          </div>
          <div class="field">
            <label>Role</label>
            <select v-model="editingUser.role" class="ui dropdown">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>
      </div>
      <div class="actions">
        <div class="ui button" @click="cancelEdit">Cancel</div>
        <div class="ui green button" @click="saveUser">Save</div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div class="ui dimmer" :class="{ 'visible active': showEditModal }" @click="cancelEdit" v-if="showEditModal"></div>
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
.ui.cards {
  margin-bottom: 2em;
}

/* Modal controls for Vue.js */
.ui.modal {
  display: none;
  position: fixed;
  z-index: 1001;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 0.28571429rem;
  box-shadow: 0 1px 3px 0 rgba(0,0,0,.12), 0 1px 2px 0 rgba(0,0,0,.24);
}

.ui.modal.visible.active {
  display: block !important;
}

.ui.dimmer {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
}

.ui.dimmer.visible.active {
  display: block !important;
}
</style>
