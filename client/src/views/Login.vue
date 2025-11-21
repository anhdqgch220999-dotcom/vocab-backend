<template>
  <div class="ui container">
    <div class="ui middle aligned center aligned grid">
      <div class="column" style="max-width: 450px;">
        <h2 class="ui teal image header">
          <div class="content">
            Log in to your account
          </div>
        </h2>
        <form class="ui large form" @submit.prevent="onSubmit" autocomplete="off">
          <div class="ui stacked segment">
            <div class="field">
              <div class="ui left icon input">
                <i class="mail icon"></i>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email address"
                  v-model="formData.email"
                  required
                  autocomplete="new-email"
                >
              </div>
            </div>
            <div class="field">
              <div class="ui left icon input">
                <i class="lock icon"></i>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password"
                  v-model="formData.password"
                  required
                  autocomplete="new-password"
                >
              </div>
            </div>
            <button 
              class="ui fluid large teal submit button" 
              type="submit"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
            >
              Login
            </button>
          </div>

          <div v-if="errorMessage" class="ui error message visible">
            <i class="warning icon"></i>
            {{ errorMessage }}
          </div>
        </form>

        <div class="ui message">
          Don't have an account? 
          <router-link to="/register">Sign up now</router-link>
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
      // Clear form data when component mounts
      formData.value = {
        email: '',
        password: ''
      };
    });

    const onSubmit = async () => {
      isLoading.value = true;
      errorMessage.value = '';

      console.log('Submitting login form with:', formData.value);

      try {
        const result = await authStore.login(formData.value);
        console.log('Login result:', result);
        
        if (result.success) {
          console.log('Login successful, redirecting to /words');
          router.push('/words');
        } else {
          errorMessage.value = result.message;
          console.log('Login failed:', result.message);
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
.ui.container {
  margin-top: 3em;
}
</style>
  