<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <div class="login-header">
          <div class="header-icon">
            <i class="user circle icon"></i>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        <form class="login-form" @submit.prevent="onSubmit" autocomplete="off">
          <div class="form-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <i class="envelope icon"></i>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email"
                v-model="formData.email"
                required
                autocomplete="new-email"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="input-wrapper">
              <i class="lock icon"></i>
              <input 
                type="password" 
                name="password" 
                placeholder="Enter your password"
                v-model="formData.password"
                required
                autocomplete="new-password"
              >
            </div>
          </div>

          <button 
            class="login-button" 
            type="submit"
            :class="{ loading: isLoading }"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Sign In</span>
            <span v-else><i class="spinner icon loading"></i> Signing in...</span>
          </button>

          <div v-if="errorMessage" class="error-message">
            <i class="times circle icon"></i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="login-footer">
          <p>Don't have an account? 
            <router-link to="/register" class="signup-link">Create one now</router-link>
          </p>
        </div>
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
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

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px 30px;
  text-align: center;
}

.header-icon {
  font-size: 60px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
}

.login-form {
  padding: 40px 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fafafa;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper i {
  padding: 0 12px;
  color: #667eea;
  font-size: 16px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0 12px 0;
  font-size: 14px;
  outline: none;
  color: #333;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  padding: 13px;
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
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button.loading {
  opacity: 0.8;
}

.error-message {
  margin-top: 20px;
  padding: 12px 15px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.login-footer {
  padding: 0 30px 30px;
  text-align: center;
}

.login-footer p {
  font-size: 14px;
  color: #666;
}

.signup-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.signup-link:hover {
  color: #764ba2;
  text-decoration: underline;
}
</style>
  