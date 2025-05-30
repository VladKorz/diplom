<script setup lang="ts">
import { NButton, NFlex, NInput, NCard, NAlert, NForm, NFormItem } from 'naive-ui';
import { ref, onMounted, computed } from 'vue';
import api from '../api/axios';
import { useRouter } from 'vue-router';

interface LoginResponse {
  token?: string;
  message?: string;
}

interface LoginForm {
  email: string;
  password: string;
}

const formData = ref<LoginForm>({
  email: '',
  password: ''
});

const loading = ref(false);
const alertMessage = ref<string>('');
const alertType = ref<'success' | 'error'>('success');
const showAlert = ref(false);

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token');
});

const router = useRouter();

// Check if user is already logged in
onMounted(() => {
  if (isLoggedIn.value) {
    alertType.value = 'success';
    alertMessage.value = 'Вы уже вошли в систему';
    showAlert.value = true;
  }
});

async function handleLogin() {
  try {
    loading.value = true;
    showAlert.value = false;

    const response = await api.post<LoginResponse>('/user/login', formData.value);

    if (response.data.token) {
      alertType.value = 'success';
      alertMessage.value = 'Вход выполнен успешно!';
      localStorage.setItem('token', response.data.token);

      // Redirect to admin panel after successful login
      router.push('/bookings');
    } else {
      alertType.value = 'error';
      alertMessage.value = response.data.message || 'Ошибка авторизации: Токен не получен';
    }
  } catch (e) {
    alertType.value = 'error';
    alertMessage.value = e instanceof Error ? e.message : 'Ошибка авторизации';
  } finally {
    loading.value = false;
    showAlert.value = true;
  }
}
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <n-card title="Вход" class="w-96">
      <n-flex vertical :size="20">
        <n-alert v-if="showAlert" :type="alertType" closable @close="showAlert = false">
          {{ alertMessage }}
        </n-alert>
        <n-input v-model:value="formData.email" placeholder="Email" />
        <n-input v-model:value="formData.password" type="password" show-password-on="click" placeholder="Пароль" />
        <n-button type="primary" block :loading="loading" @click="handleLogin">
          Войти
        </n-button>
      </n-flex>
    </n-card>
  </div>
</template>

<style scoped>
.n-card {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
</style>