<template>
  <div class="ui container" style="margin-top: 3em;">
    <div class="ui middle aligned center aligned grid">
      <div class="column" style="max-width: 450px;">
        <h2 class="ui teal image header">
          <div class="content">
            Sign in to your account
          </div>
        </h2>
        <form class="ui large form" @submit.prevent="onSubmit">
          <div class="ui stacked segment">
            <div class="field">
              <div class="ui left icon input">
                <i class="user icon"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail address"
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
                  placeholder="Password"
                  v-model="formData.password"
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
              Sign in
            </button>
          </div>

          <div v-if="errorMessage" class="ui error message">
            {{ errorMessage }}
          </div>
        </form>

        <div class="ui message">
          New to us? 
          <router-link to="/register">Sign Up</router-link>
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
.ui.container {
  margin-top: 3em;
}
</style>
  