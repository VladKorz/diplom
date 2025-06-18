<script setup lang="ts">
import { NResult, NButton, NText } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';

const router = useRouter();
const route = useRoute();

const errorCode = ref<number>(Number(route.query.code) || 500);
const errorMessage = ref<string>(route.query.message as string || 'Произошла непредвиденная ошибка');
const previousRoute = ref<string>(route.query.from ? decodeURIComponent(route.query.from as string) : '/');

const isClientError = ref(errorCode.value >= 400 && errorCode.value < 500);

function handleGoHome() {
    router.push('/orders');
}

function handleGoBack() {
    if (window.history.length > 1) {
        router.go(-1);
    } else {
        router.replace('/orders');
    }
}

function handleRetry() {
    if (window.history.length > 1) {
        router.go(-1);
    } else {
        router.replace('/orders');
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
}

onMounted(() => {
    // Update error details if they change in the route
    errorCode.value = Number(route.query.code) || 500;
    errorMessage.value = route.query.message as string || 'Произошла непредвиденная ошибка';
    previousRoute.value = route.query.from ? decodeURIComponent(route.query.from as string) : '/';
    isClientError.value = errorCode.value >= 400 && errorCode.value < 500;
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div class="max-w-md w-full">
            <n-result :status="isClientError ? 'warning' : 'error'"
                :title="isClientError ? 'Ошибка клиента' : 'Ошибка сервера'" :description="errorMessage">
                <template #footer>
                    <div class="flex flex-col gap-4">
                        <n-text depth="3" class="text-center">
                            Код ошибки: {{ errorCode }}
                        </n-text>

                        <div class="flex flex-wrap gap-4 justify-center">
                            <n-button @click="handleGoBack">
                                Назад
                            </n-button>
                            <n-button @click="handleRetry">
                                Попробовать снова
                            </n-button>
                            <n-button @click="handleGoHome">
                                На главную
                            </n-button>
                            <n-button v-if="errorCode === 401" type="error" @click="handleLogout">
                                Выйти
                            </n-button>
                        </div>
                    </div>
                </template>
            </n-result>
        </div>
    </div>
</template>