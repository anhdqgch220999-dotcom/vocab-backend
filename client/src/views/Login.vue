<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="login-title">Sign in to your account</h2>
      
      <form class="login-form" @submit.prevent="onSubmit">
        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="E-mail address"
            v-model="formData.email"
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            v-model="formData.password"
            required
            class="form-input"
          >
        </div>

        <button 
          class="login-button" 
          type="submit"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          Sign In
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        New to us? 
        <router-link to="/register" class="signup-link">Sign Up</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../helpers/auth';

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const isLoading = ref(false);
    const errorMessage = ref('');
    
    const formData = ref({
      email: '',
      password: ''
    });

    onMounted(() => {
      formData.value = {
        email: '',
        password: ''
      };
    });

    const onSubmit = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      try {
        const result = await authStore.login(formData.value);
        
        if (result.success) {
          router.push('/words');
        } else {
          errorMessage.value = result.message;
        }
      } catch (error) {
        console.error('Login error:', error);
        errorMessage.value = 'An error occurred. Please try again!';
      } finally {
        isLoading.value = false;
      }
    };

    return {
      formData,
      onSubmit,
      isLoading,
      errorMessage
    };
  }
};
</script>

<style scoped>
.login-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  padding: 40px;
  max-width: 450px;
  width: 100%;
}

.login-title {
  text-align: center;
  color: #1f2937;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 700;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  color: #1f2937;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.login-button {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  color: #991b1b;
  font-size: 14px;
  text-align: center;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
  font-size: 14px;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-left: 5px;
}

.signup-link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
  