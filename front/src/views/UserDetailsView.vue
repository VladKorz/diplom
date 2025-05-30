<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Информация о пользователе</h1>
                <n-flex align="center" gap="16">
                    <n-button type="error" @click="handleLogout">
                        Выйти
                    </n-button>
                </n-flex>
            </n-flex>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-4 overflow-auto">
            <n-card v-if="user" title="Информация о пользователе" class="user-card">
                <template #header-extra>
                    <n-flex gap="12">
                        <n-button type="primary" @click="showUpdateModal = true">
                            Обновить пользователя
                        </n-button>
                        <n-button type="info" @click="showPasswordModal = true">
                            Изменить пароль
                        </n-button>
                    </n-flex>
                </template>
                <n-spin :show="loading">
                    <div class="user-info">
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ user.email }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Имя:</span>
                            <span class="info-value">{{ user.name }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Фамилия:</span>
                            <span class="info-value">{{ user.surname }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Номер телефона:</span>
                            <span class="info-value">{{ user.phoneNumber }}</span>
                        </div>
                    </div>
                </n-spin>
            </n-card>
        </div>

        <!-- Update Modal -->
        <n-modal v-model:show="showUpdateModal" preset="card" title="Обновить информацию о пользователе"
            style="width: 600px">
            <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="auto"
                require-mark-placement="right-hanging">
                <n-form-item label="Email" path="email">
                    <n-input v-model:value="formValue.email" placeholder="Введите email" />
                </n-form-item>
                <n-form-item label="Имя" path="name">
                    <n-input v-model:value="formValue.name" placeholder="Введите имя" />
                </n-form-item>
                <n-form-item label="Фамилия" path="surname">
                    <n-input v-model:value="formValue.surname" placeholder="Введите фамилию" />
                </n-form-item>
                <n-form-item label="Номер телефона" path="phoneNumber">
                    <n-input v-model:value="formValue.phoneNumber" placeholder="Введите номер телефона" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showUpdateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updating" @click="handleUpdate">
                        Обновить
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Password Update Modal -->
        <n-modal v-model:show="showPasswordModal" preset="card" title="Изменить пароль" style="width: 600px">
            <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item label="Новый пароль" path="password">
                    <n-input v-model:value="passwordForm.password" type="password" placeholder="Введите новый пароль"
                        show-password-on="click" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showPasswordModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updatingPassword" @click="handlePasswordUpdate">
                        Обновить пароль
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NCard, NButton, NFlex, NSpin, useMessage, NModal, NForm, NFormItem, NInput } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'

interface User {
    id: number
    email: string
    name: string
    surname: string
    phoneNumber: string
}

interface UpdateForm {
    email: string
    name: string
    surname: string
    phoneNumber: string
}

interface PasswordForm {
    password: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const loading = ref(false)
const updating = ref(false)
const updatingPassword = ref(false)
const user = ref<User | null>(null)
const showUpdateModal = ref(false)
const showPasswordModal = ref(false)
const formRef = ref<FormInst | null>(null)
const passwordFormRef = ref<FormInst | null>(null)

const formValue = ref<UpdateForm>({
    email: '',
    name: '',
    surname: '',
    phoneNumber: ''
})

const passwordForm = ref<PasswordForm>({
    password: ''
})

const rules: FormRules = {
    email: {
        type: 'email',
        message: 'Пожалуйста, введите корректный email',
        trigger: ['blur', 'input']
    }
}

const passwordRules: FormRules = {
    password: {
        required: true,
        message: 'Пожалуйста, введите новый пароль',
        trigger: ['blur', 'input']
    }
}

const fetchUser = async () => {
    const userId = route.params.id
    try {
        loading.value = true
        const response = await api.get(`/user/${userId}`)
        if (response.data.message === 'User retrieved successfully' && response.data.user) {
            user.value = response.data.user
            // Initialize form with current values
            if (user.value) {
                formValue.value = {
                    email: user.value.email,
                    name: user.value.name,
                    surname: user.value.surname,
                    phoneNumber: user.value.phoneNumber
                }
            }
        } else {
            throw new Error('User data not found in response')
        }
    } catch (error: any) {
        console.error('Error fetching user:', error)
        message.error('Не удалось получить пользователя: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
        router.push('/users')
    } finally {
        loading.value = false
    }
}

const handleUpdate = async () => {
    if (!user.value) return

    try {
        updating.value = true
        const response = await api.patch(`/user/${user.value.id}`, formValue.value)
        if (response.data.message === 'User updated successfully') {
            message.success('Пользователь успешно обновлен')
            showUpdateModal.value = false
            await fetchUser() // Refresh user data
        } else {
            throw new Error('Не удалось обновить пользователя')
        }
    } catch (error: any) {
        console.error('Error updating user:', error)
        message.error('Не удалось обновить пользователя: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        updating.value = false
    }
}

const handlePasswordUpdate = async () => {
    if (!user.value) return

    try {
        updatingPassword.value = true
        console.log('Sending password update request:', {
            url: `/user/${user.value.id}/password`,
            data: passwordForm.value
        })

        const response = await api.patch(`/user/${user.value.id}/password`, passwordForm.value)
        console.log('Password update response:', response.data)

        // If we get here, the request was successful (status 200)
        message.success('Пароль успешно обновлен')
        showPasswordModal.value = false
        passwordForm.value.password = '' // Clear the password field
    } catch (error: any) {
        console.error('Error updating password:', {
            error,
            response: error.response?.data,
            status: error.response?.status,
            message: error.message
        })

        const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
        message.error(`Не удалось обновить пароль: ${errorMessage}`)
    } finally {
        updatingPassword.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

onMounted(() => {
    fetchUser()
})
</script>

<style scoped>
.user-card {
    max-width: 600px;
    margin: 20px auto;
}

.user-info .info-row {
    display: flex;
    margin-bottom: 10px;
}

.user-info .info-label {
    font-weight: bold;
    margin-right: 10px;
    flex-shrink: 0;
}

.user-info .info-value {
    word-break: break-all;
}
</style>