<template>
  <div>
    <div class="ui inverted segment navbar">
      <div class="ui container">
        <div class="navbar-content">
          <div class="ui large secondary inverted pointing menu compact">
            <template v-if="authStore.isLoggedIn">
              <router-link to="/words" class="item">
                <i class="list icon"></i>Words
              </router-link>
              <router-link to="/words/new" class="item">
                <i class="plus icon"></i>New
              </router-link>
              <router-link to="/quiz" class="item">
                <i class="question circle icon"></i>Quiz
              </router-link>
              
              <router-link v-if="authStore.user?.role === 'admin'" to="/admin/users" class="item">
                Manage Users
              </router-link>
              <router-link v-if="authStore.user?.role === 'admin'" to="/admin/languages" class="item">
                Manage Languages
              </router-link>
            </template>
            
            <template v-else>
              <router-link to="/login" class="item">
                <i class="sign in icon"></i>Login
              </router-link>
              <router-link to="/register" class="item">
                <i class="user plus icon"></i>Register
              </router-link>
            </template>
          </div>
          
          <div class="user-section" v-if="authStore.isLoggedIn && authStore.user">
            <div class="user-greeting">
              <i class="user icon"></i>
              Hello, {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </div>
            <button class="ui red button logout-btn" @click="logout">
              <i class="sign out icon"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="ui container">
      <div class="ui grid">
        <div class="row">
          <div class="twelve wide column">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { authStore } from './src/helpers/auth';

export default {
  name: 'App',
  setup() {
    const router = useRouter();

    const logout = () => {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        authStore.logout();
        router.push('/login');
      }
    };

    return {
      authStore,
      logout
    };
  }
}
</script>

<style>
.navbar {
  margin-bottom: 2em;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
}

.user-greeting {
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-greeting i {
  opacity: 0.8;
}

.logout-btn {
  padding: 8px 12px !important;
  font-size: 12px !important;
}

.logout-btn:hover {
  background-color: #dc3545 !important;
}
</style>