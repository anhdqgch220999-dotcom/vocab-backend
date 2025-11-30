<template>
  <div class="register-page">
    <div class="register-card">
      <h2 class="register-title">Create new account</h2>
      
      <form class="register-form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="First Name"
              v-model="formData.firstName"
              required
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              placeholder="Last Name"
              v-model="formData.lastName"
              required
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Username"
            v-model="formData.username"
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="Email"
            v-model="formData.email"
            required
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Password (at least 6 characters)"
            v-model="formData.password"
            required
            minlength="6"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Confirm Password</label>
          <input 
            type="password" 
            placeholder="Confirm Password"
            v-model="formData.confirmPassword"
            required
            class="form-input"
          >
        </div>
        
        <button 
          class="register-button" 
          type="submit"
          :class="{ loading: isLoading }"
          :disabled="isLoading"
        >
          Register
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div class="register-footer">
        Already have an account? 
        <router-link to="/login" class="signin-link">Sign in now</router-link>
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

.register-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2dd4bf;
  padding: 20px;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 50px;
  max-width: 480px;
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.register-title {
  text-align: center;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 35px;
  font-size: 28px;
  font-weight: 700;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: #2dd4bf;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-input {
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  color: #1f2937;
  background: linear-gradient(135deg, #f8fdfc 0%, #f0fdfb 100%);
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:hover {
  border-color: #2dd4bf;
  background: linear-gradient(135deg, #f0fdfb 0%, #ecfdf5 100%);
}

.form-input:focus {
  border-color: #2dd4bf;
  background: white;
  box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.15);
}

.form-input::placeholder {
  color: #a8b5bf;
}

.register-button {
  padding: 14px;
  background: linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(45, 212, 191, 0.3);
}

.register-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(45, 212, 191, 0.5);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  padding: 13px;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  font-size: 13px;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-footer {
  text-align: center;
  margin-top: 25px;
  color: #6b7280;
  font-size: 14px;
}

.signin-link {
  color: #f093fb;
  text-decoration: none;
  font-weight: 700;
  transition: all 0.3s ease;
  margin-left: 6px;
}

.signin-link:hover {
  color: #f5576c;
  text-decoration: underline;
}
</style>
