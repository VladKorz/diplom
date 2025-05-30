<template>
    <n-layout class="h-screen">
        <!-- Header -->
        <n-layout-header bordered>
            <n-flex justify="space-between" align="center" style="padding: 16px;">
                <n-text strong size="large">Пользователи</n-text>
                <n-flex align="center" gap="16">
                    <n-button type="primary" @click="showCreateModal = true">
                        Создать пользователя
                    </n-button>
                    <n-button type="error" @click="handleLogout">
                        Выйти
                    </n-button>
                </n-flex>
            </n-flex>
        </n-layout-header>

        <!-- Main Content -->
        <n-layout-content style="padding: 16px;">
            <n-card>
                <n-data-table :columns="columns" :data="users" :loading="loading" :pagination="pagination" />
            </n-card>
        </n-layout-content>

        <!-- Role Assignment Modal -->
        <n-modal v-model:show="showRoleModal" preset="card" title="Назначить роли" style="width: 500px">
            <n-space vertical>
                <div v-if="selectedUser" style="margin-bottom: 16px;">
                    <n-text strong size="large">Назначение ролей для:</n-text>
                    <n-text depth="3" style="display: block; margin-top: 4px;">
                        {{ selectedUser.name }} {{ selectedUser.surname }}
                    </n-text>
                </div>

                <n-flex justify="space-between" align="center" style="margin-bottom: 8px;">
                    <n-button size="small" @click="handleSelectAll">
                        Выбрать все
                    </n-button>
                    <n-button size="small" @click="handleDeselectAll">
                        Снять выбор
                    </n-button>
                </n-flex>

                <n-card class="roles-list-card">
                    <n-checkbox-group v-model:value="selectedRoles">
                        <n-space vertical>
                            <n-checkbox v-for="role in allRoles" :key="role" :value="role" class="role-checkbox">
                                {{ formatRoleName(role) }}
                            </n-checkbox>
                        </n-space>
                    </n-checkbox-group>
                </n-card>
            </n-space>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showRoleModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="assigningRoles" @click="handleAssignRoles">
                        Назначить роли
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Create User Modal -->
        <n-modal v-model:show="showCreateModal" preset="card" style="width: 500px" title="Создать нового пользователя"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="createFormRef" :model="createForm" :rules="createRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="email" label="Email">
                    <n-input v-model:value="createForm.email" placeholder="Введите email" />
                </n-form-item>
                <n-form-item path="name" label="Имя">
                    <n-input v-model:value="createForm.name" placeholder="Введите имя" />
                </n-form-item>
                <n-form-item path="surname" label="Фамилия">
                    <n-input v-model:value="createForm.surname" placeholder="Введите фамилию" />
                </n-form-item>
                <n-form-item path="phoneNumber" label="Номер телефона">
                    <n-input v-model:value="createForm.phoneNumber" placeholder="Введите номер телефона" />
                </n-form-item>
                <n-form-item path="password" label="Пароль">
                    <n-input v-model:value="createForm.password" type="password" placeholder="Введите пароль" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creating" @click="handleCreate">
                        Создать пользователя
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NFlex, useMessage, NModal, NCheckbox, NCheckboxGroup, NForm, NFormItem, NInput, NLayout, NLayoutHeader, NLayoutContent, NText } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

interface User {
    id: number
    email: string
    name: string
    surname: string
    phoneNumber: string
}

const router = useRouter()
const message = useMessage()
const users = ref<User[]>([])
const loading = ref(false)
const showRoleModal = ref(false)
const selectedUser = ref<User | null>(null)
const assigningRoles = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const createFormRef = ref<FormInst | null>(null)

const formatRoleName = (role: string) => {
    const roleTranslations: { [key: string]: string } = {
        "read_all_users": "Просмотр всех пользователей",
        "read_all_managers": "Просмотр всех менеджеров",
        "read_all_admins": "Просмотр всех администраторов",
        "assign_role": "Назначение ролей",
        "absolve_role": "Снятие ролей",
        "user_create": "Создание пользователей",
        "user_edit": "Редактирование пользователей",
        "user_view": "Просмотр пользователей",
        "user_delete": "Удаление пользователей",
        "payment_create": "Создание платежей",
        "payment_edit": "Редактирование платежей",
        "payment_view": "Просмотр платежей",
        "payment_delete": "Удаление платежей",
        "rent_object_create": "Создание объектов аренды",
        "rent_object_edit": "Редактирование объектов аренды",
        "rent_object_view": "Просмотр объектов аренды",
        "rent_object_delete": "Удаление объектов аренды",
        "service_create": "Создание услуг",
        "service_edit": "Редактирование услуг",
        "service_view": "Просмотр услуг",
        "service_delete": "Удаление услуг",
        "client_create": "Создание клиентов",
        "client_edit": "Редактирование клиентов",
        "client_view": "Просмотр клиентов",
        "client_delete": "Удаление клиентов",
        "booking_create": "Создание бронирований",
        "booking_edit": "Редактирование бронирований",
        "booking_view": "Просмотр бронирований",
        "booking_delete": "Удаление бронирований",
        "booking_cancel": "Отмена бронирований",
        "product_create": "Создание товаров",
        "product_edit": "Редактирование товаров",
        "product_view": "Просмотр товаров",
        "product_delete": "Удаление товаров",
        "order_products": "Заказ товаров",
        "order_view_products": "Просмотр заказов товаров",
        "order_view_service": "Просмотр заказов услуг",
        "product_client_view": "Просмотр товаров клиентом",
        "disorder_product": "Отмена заказа товаров",
        "order_service": "Заказ услуг",
        "service_client_view": "Просмотр услуг клиентом",
        "disorder_service": "Отмена заказа услуг",
        "rent_object_client_view": "Просмотр объектов аренды клиентом",
        "booking_client_view": "Просмотр бронирований клиентом",
        "booking_client_create": "Создание бронирований клиентом",
        "booking_client_cancel": "Отмена бронирований клиентом",
        "payment_client_create": "Создание платежей клиентом",
        "order_products_edit": "Редактирование заказов товаров",
        "order_service_edit": "Редактирование заказов услуг"
    }
    return roleTranslations[role] || role
}

const allRoles = [
    "read_all_users",
    "read_all_managers",
    "read_all_admins",
    "assign_role",
    "absolve_role",
    "user_create",
    "user_edit",
    "user_view",
    "user_delete",
    "payment_create",
    "payment_edit",
    "payment_view",
    "payment_delete",
    "rent_object_create",
    "rent_object_edit",
    "rent_object_view",
    "rent_object_delete",
    "service_create",
    "service_edit",
    "service_view",
    "service_delete",
    "client_create",
    "client_edit",
    "client_view",
    "client_delete",
    "booking_create",
    "booking_edit",
    "booking_view",
    "booking_delete",
    "booking_cancel",
    "product_create",
    "product_edit",
    "product_view",
    "product_delete",
    "order_products",
    "order_view_products",
    "order_view_service",
    "product_client_view",
    "disorder_product",
    "order_service",
    "service_client_view",
    "disorder_service",
    "rent_object_client_view",
    "booking_client_view",
    "payment_client_view",
    "booking_client_create",
    "booking_client_cancel",
    "payment_client_create",
    "order_products_edit",
    "order_service_edit"
]

const selectedRoles = ref<string[]>([])

const pagination = {
    pageSize: 10
}

const columns: DataTableColumns<User> = [
    {
        title: 'Имя',
        key: 'name'
    },
    {
        title: 'Фамилия',
        key: 'surname'
    },
    {
        title: 'Email',
        key: 'email'
    },
    {
        title: 'Номер телефона',
        key: 'phoneNumber'
    },
    {
        title: 'Действия',
        key: 'actions',
        render: (row) => {
            return h(
                NFlex,
                { gap: 8 },
                {
                    default: () => [
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'primary',
                                onClick: () => {
                                    console.log('Navigating to user:', row.id)
                                    router.push(`/users/${row.id}`)
                                }
                            },
                            { default: () => 'Просмотр' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'info',
                                onClick: () => {
                                    selectedUser.value = row
                                    selectedRoles.value = []
                                    showRoleModal.value = true
                                }
                            },
                            { default: () => 'Назначить роли' }
                        )
                    ]
                }
            )
        }
    }
]

const createForm = ref({
    email: '',
    name: '',
    surname: '',
    phoneNumber: '',
    password: ''
})

const createRules: FormRules = {
    email: {
        required: true,
        type: 'email',
        message: 'Please enter a valid email',
        trigger: 'blur'
    },
    name: {
        required: true,
        message: 'Please enter name',
        trigger: 'blur'
    },
    surname: {
        required: true,
        message: 'Please enter surname',
        trigger: 'blur'
    },
    phoneNumber: {
        required: true,
        message: 'Please enter phone number',
        trigger: 'blur'
    },
    password: {
        required: true,
        message: 'Please enter password',
        trigger: 'blur'
    }
}

const fetchUsers = async () => {
    try {
        loading.value = true
        const response = await api.get('/user/all')
        if (response.data.message === 'Users retrieved successfully' && Array.isArray(response.data.users)) {
            users.value = response.data.users
        } else {
            throw new Error('Invalid users data format')
        }
    } catch (error: any) {
        console.error('Error fetching users:', error)
        if (error.response) {
            message.error('Failed to fetch users: ' + (error.response.data?.message || 'Server error'))
        } else if (error.request) {
            message.error('No response from server. Please check your connection.')
        } else {
            message.error('Failed to fetch users: ' + error.message)
        }
    } finally {
        loading.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const handleAssignRoles = async () => {
    if (!selectedUser.value) return

    try {
        assigningRoles.value = true
        const response = await api.post(`/role/assign-multiple/${selectedUser.value.id}`, {
            roles: selectedRoles.value
        })
        message.success('Roles assigned successfully')
        showRoleModal.value = false
    } catch (error: any) {
        console.error('Error assigning roles:', error)
        message.error('Failed to assign roles: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        assigningRoles.value = false
    }
}

const handleSelectAll = () => {
    selectedRoles.value = [...allRoles]
}

const handleDeselectAll = () => {
    selectedRoles.value = []
}

const handleCreate = async () => {
    try {
        await createFormRef.value?.validate()
        creating.value = true

        const response = await api.post('/user', createForm.value)
        message.success('User created successfully')
        showCreateModal.value = false
        createForm.value = {
            email: '',
            name: '',
            surname: '',
            phoneNumber: '',
            password: ''
        }
        await fetchUsers() // Refresh the list
    } catch (error: any) {
        console.error('Error creating user:', error)
        message.error('Failed to create user: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        creating.value = false
    }
}

onMounted(() => {
    fetchUsers()
})
</script>

<style scoped>
.n-card {
    height: 100%;
}

.role-checkbox {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--n-border-color);
}

.role-checkbox:last-child {
    border-bottom: none;
}

.role-checkbox :deep(.n-checkbox__label) {
    font-size: 14px;
    color: var(--n-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.role-checkbox :deep(.n-checkbox) {
    min-width: 16px;
    margin-right: 8px;
}

.roles-list-card {
    max-height: 400px;
    overflow-y: auto;
}

.roles-list-card :deep(.n-card__content) {
    padding: 12px;
}
</style>