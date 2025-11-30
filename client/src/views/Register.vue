<template>
  <div class="ui container">
    <div class="ui middle aligned center aligned grid">
      <div class="column" style="max-width: 450px;">
        <h2 class="ui teal image header">
          <div class="content">
            Create new account
          </div>
        </h2>
        <form class="ui large form" @submit.prevent="onSubmit">
          <div class="ui stacked segment">
            <div class="two fields">
              <div class="field">
                <div class="ui left icon input">
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
              <div class="field">
                <div class="ui left icon input">
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
            
            <div class="field">
              <div class="ui left icon input">
                <i class="at icon"></i>
                <input 
                  type="text" 
                  name="username" 
                  placeholder="Username"
                  v-model="formData.username"
                  required
                >
              </div>
            </div>
            
            <div class="field">
              <div class="ui left icon input">
                <i class="mail icon"></i>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email"
                  v-model="formData.email"
                  required
                >
              </div>
            </div>
            
            <div class="field">
              <div class="ui left icon input">
                <i class="lock icon"></i>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password (at least 6 characters)"
                  v-model="formData.password"
                  required
                  minlength="6"
                >
              </div>
            </div>
            
            <div class="field">
              <div class="ui left icon input">
                <i class="lock icon"></i>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm Password"
                  v-model="formData.confirmPassword"
                  required
                >
              </div>
            </div>
            
            <button 
              class="ui fluid large teal submit button" 
              type="submit"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              Register
            </button>
          </div>

          <div v-if="errorMessage" class="ui error message">
            {{ errorMessage }}
          </div>
        </form>

        <div class="ui message">
          Already have an account? 
          <router-link to="/login">Sign in now</router-link>
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

      // Kiểm tra mật khẩu xác nhận
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = 'Password confirmation does not match!';
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
.ui.container {
  margin-top: 3em;
}
</style>
