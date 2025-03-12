<template>
  <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20">
    <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-border w-full lg:w-6/12 mx-auto">
      <div class="text-center mb-8">
        <svg class="mb-4 mx-auto fill-surface-600 dark:fill-surface-200 h-16" viewBox="0 0 30 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M20.7207 6.18211L14.9944 3.11148L3.46855 9.28678L0.579749 7.73444L14.9944 0L23.6242 4.62977L20.7207 6.18211ZM14.9996 12.3574L26.5182 6.1821L29.4216 7.73443L14.9996 15.4621L6.37724 10.8391L9.27337 9.28677L14.9996 12.3574ZM2.89613 16.572L0 15.0196V24.2656L14.4147 32V28.8953L2.89613 22.7132V16.572ZM11.5185 18.09L0 11.9147V8.81001L14.4147 16.5376V25.7904L11.5185 24.2312V18.09ZM24.2086 15.0194V11.9147L15.5788 16.5377V31.9998L18.475 30.4474V18.09L24.2086 15.0194ZM27.0969 22.7129V10.3623L30.0004 8.81V24.2653L21.3706 28.895V25.7904L27.0969 22.7129Z"
          />
        </svg>

        <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome Back</div>

      </div>

      <div>
        <label for="email" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Email</label>
        <InputText id="email" type="email" v-model="loginData.email" placeholder="Email address" class="w-full mb-4" />

        <label for="password" class="text-surface-900 dark:text-surface-0 font-medium mb-2 block">Password</label>
        <InputText id="password" type="password" v-model="loginData.password" placeholder="Password" class="w-full mb-4" />

        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center">
            <Checkbox id="rememberme" v-model="rememberMe" :binary="true" class="mr-2" />
            <label for="rememberme">Remember me</label>
          </div>
        </div>

        <Button label="Sign In" icon="pi pi-user !text-xl !leading-none" class="w-full" @click="login" :loading="loading" />
      </div>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService'; // Create authService

const toast = useToast();
const router = useRouter();

const loginData = ref({
  email: '',
  password: ''
});
const rememberMe = ref(false);
const loading = ref(false);

const login = async () => {
  loading.value = true;
  try {
    const response = await authService.login(loginData.value);
    console.log(response)
    // Store token and user role (You might use Vuex/Pinia for a larger app)
    localStorage.setItem('accessToken', response.access_token);
    localStorage.setItem('userRole', response.user.role);

    toast.add({ severity: 'success', summary: 'Login Successful', detail: `Welcome, ${response.user.name}!`, life: 3000 });

    // Redirect to dashboard after successful login
    await router.push('/dashboard');

  } catch (error) {
    console.error('Login failed:', error);
    toast.add({ severity: 'error', summary: 'Login Failed', detail: error.response?.data?.message || 'Invalid credentials', life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>