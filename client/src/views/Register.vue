<template>
  <div class="register-container">
    <div class="register-wrapper">
      <div class="register-card">
        <div class="register-header">
          <div class="header-icon">
            <i class="user plus icon"></i>
          </div>
          <h2>Create Account</h2>
          <p>Join us to start learning</p>
        </div>

        <form class="register-form" @submit.prevent="onSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>First Name</label>
              <div class="input-wrapper">
                <i class="user icon"></i>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  v-model="formData.firstName"
                  required
                >
              </div>
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <div class="input-wrapper">
                <i class="user icon"></i>
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Last Name"
                  v-model="formData.lastName"
                  required
                >
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Username</label>
            <div class="input-wrapper">
              <i class="at icon"></i>
              <input 
                type="text" 
                name="username" 
                placeholder="Choose a username"
                v-model="formData.username"
                required
              >
            </div>
          </div>
          
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
                placeholder="At least 6 characters"
                v-model="formData.password"
                required
                minlength="6"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label>Confirm Password</label>
            <div class="input-wrapper">
              <i class="lock icon"></i>
              <input 
                type="password" 
                name="confirmPassword" 
                placeholder="Confirm your password"
                v-model="formData.confirmPassword"
                required
              >
            </div>
          </div>
          
          <button 
            class="register-button" 
            type="submit"
            :class="{ loading: isLoading }"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Create Account</span>
            <span v-else><i class="spinner icon loading"></i> Creating...</span>
          </button>

          <div v-if="errorMessage" class="error-message">
            <i class="times circle icon"></i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="register-footer">
          <p>Already have an account? 
            <router-link to="/login" class="signin-link">Sign in here</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authStore } from '../helpers/auth';

export default {
  name: "Register",
  setup() {
    const router = useRouter();
    const isLoading = ref(false);
    const errorMessage = ref('');
    
    const formData = ref({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    const onSubmit = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = 'Passwords do not match!';
        isLoading.value = false;
        return;
      }

      try {
        const result = await authStore.register(formData.value);
        
        if (result.success) {
          router.push('/words');
        } else {
          errorMessage.value = result.message;
        }
      } catch (error) {
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

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-wrapper {
  width: 100%;
  max-width: 500px;
}

.register-card {
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

.register-header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 40px 30px 30px;
  text-align: center;
}

.header-icon {
  font-size: 60px;
  margin-bottom: 15px;
  opacity: 0.9;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.register-header p {
  font-size: 14px;
  opacity: 0.9;
}

.register-form {
  padding: 40px 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
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
  border-color: #f5576c;
  background: white;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
}

.input-wrapper i {
  padding: 0 12px;
  color: #f5576c;
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

.register-button {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 15px;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(245, 87, 108, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-button.loading {
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

.register-footer {
  padding: 0 30px 30px;
  text-align: center;
}

.register-footer p {
  font-size: 14px;
  color: #666;
}

.signin-link {
  color: #f5576c;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.signin-link:hover {
  color: #f093fb;
  text-decoration: underline;
}
</style>
