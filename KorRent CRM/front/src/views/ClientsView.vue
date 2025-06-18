<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Клиенты</h1>
                <n-flex align="center" gap="16">
                    <n-button type="info" @click="showSearchModal = true">
                        Найти клиента
                    </n-button>
                    <n-button type="primary" @click="showCreateModal = true">
                        Создать клиента
                    </n-button>
                    <n-button type="error" @click="handleLogout">
                        Выйти
                    </n-button>
                </n-flex>
            </n-flex>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-4 overflow-auto">
            <n-card>
                <n-data-table :columns="columns" :data="filteredClients" :loading="loading" :pagination="pagination"
                    @row-click="handleRowClick" :row-props="rowProps" />
            </n-card>
        </div>

        <!-- Search Modal -->
        <n-modal v-model:show="showSearchModal" preset="card" style="width: 600px" title="Поиск клиента"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="searchFormRef" :model="searchForm" label-placement="left" label-width="auto">
                <n-form-item path="name" label="Имя">
                    <n-auto-complete v-model:value="searchForm.name" :options="nameOptions" placeholder="Введите имя" />
                </n-form-item>
                <n-form-item path="surname" label="Фамилия">
                    <n-auto-complete v-model:value="searchForm.surname" :options="surnameOptions"
                        placeholder="Введите фамилию" />
                </n-form-item>
                <n-form-item path="phoneNumber" label="Телефон">
                    <n-auto-complete v-model:value="searchForm.phoneNumber" :options="phoneOptions"
                        placeholder="Введите номер телефона" />
                </n-form-item>
                <n-form-item path="email" label="Email">
                    <n-auto-complete v-model:value="searchForm.email" :options="emailOptions"
                        placeholder="Введите email" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="clearSearch">Очистить</n-button>
                    <n-button type="primary" @click="showSearchModal = false">
                        Закрыть
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Update Client Modal -->
        <n-modal v-model:show="showUpdateModal" preset="card" style="width: 600px" title="Обновить клиента"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="updateFormRef" :model="updateFormValue" :rules="updateRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Имя">
                    <n-input v-model:value="updateFormValue.name" placeholder="Введите имя клиента" />
                </n-form-item>
                <n-form-item path="surname" label="Фамилия">
                    <n-input v-model:value="updateFormValue.surname" placeholder="Введите фамилию клиента" />
                </n-form-item>
                <n-form-item path="phoneNumber" label="Телефон">
                    <n-input v-model:value="updateFormValue.phoneNumber" placeholder="Введите номер телефона" />
                </n-form-item>
                <n-form-item path="email" label="Email">
                    <n-input v-model:value="updateFormValue.email" placeholder="Введите email адрес" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showUpdateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updating" @click="handleUpdateClient">
                        Обновить клиента
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Create Client Modal -->
        <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px" title="Создать нового клиента"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="createFormRef" :model="createFormValue" :rules="createRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Имя">
                    <n-input v-model:value="createFormValue.name" placeholder="Введите имя клиента" />
                </n-form-item>
                <n-form-item path="surname" label="Фамилия">
                    <n-input v-model:value="createFormValue.surname" placeholder="Введите фамилию клиента" />
                </n-form-item>
                <n-form-item path="phoneNumber" label="Телефон">
                    <n-input v-model:value="createFormValue.phoneNumber" placeholder="Введите номер телефона" />
                </n-form-item>
                <n-form-item path="email" label="Email">
                    <n-input v-model:value="createFormValue.email" placeholder="Введите email адрес" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creating" @click="handleCreateClient">
                        Создать клиента
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { NCard, NDataTable, NButton, NFlex, NModal, NForm, NFormItem, NInput, NInputNumber, useMessage, NAutoComplete } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

interface Client {
    id: number
    name: string
    surname: string
    phoneNumber: string
    email: string
    createdAt: string
    updatedAt: string
}

interface UpdateClientForm {
    name?: string
    surname?: string
    phoneNumber?: string
    email?: string
}

const router = useRouter()
const message = useMessage()
const clients = ref<Client[]>([])
const loading = ref(false)
const updating = ref(false)
const showUpdateModal = ref(false)
const showCreateModal = ref(false)
const creating = ref(false)
const updateFormRef = ref<FormInst | null>(null)
const selectedClientId = ref<number | null>(null)
const createFormRef = ref<FormInst | null>(null)

const updateFormValue = ref<UpdateClientForm>({
    name: '',
    surname: '',
    phoneNumber: '',
    email: ''
})

const createFormValue = ref({
    name: '',
    surname: '',
    phoneNumber: '',
    email: ''
})

const updateRules: FormRules = {
    name: {
        type: 'string',
        message: 'Пожалуйста, введите корректное имя',
        trigger: 'blur'
    },
    surname: {
        type: 'string',
        message: 'Пожалуйста, введите корректную фамилию',
        trigger: 'blur'
    },
    phoneNumber: {
        type: 'string',
        message: 'Пожалуйста, введите корректный номер телефона',
        trigger: 'blur'
    },
    email: {
        type: 'email',
        message: 'Пожалуйста, введите корректный email адрес',
        trigger: 'blur'
    }
}

const createRules: FormRules = {
    name: {
        required: true,
        type: 'string',
        message: 'Пожалуйста, введите имя клиента',
        trigger: 'blur'
    },
    surname: {
        required: true,
        type: 'string',
        message: 'Пожалуйста, введите фамилию клиента',
        trigger: 'blur'
    },
    phoneNumber: {
        required: true,
        type: 'string',
        message: 'Пожалуйста, введите номер телефона',
        trigger: 'blur'
    },
    email: {
        required: true,
        type: 'email',
        message: 'Пожалуйста, введите корректный email адрес',
        trigger: 'blur'
    }
}

const pagination = {
    pageSize: 10
}

const columns: DataTableColumns<Client> = [
    {
        title: 'Имя',
        key: 'name'
    },
    {
        title: 'Фамилия',
        key: 'surname'
    },
    {
        title: 'Телефон',
        key: 'phoneNumber'
    },
    {
        title: 'Email',
        key: 'email'
    }
]

const fetchClients = async () => {
    try {
        loading.value = true
        const response = await api.get('/client/all')
        clients.value = response.data.client
    } catch (error) {
        console.error('Error fetching clients:', error)
        message.error('Не удалось получить клиентов')
    } finally {
        loading.value = false
    }
}

const handleRowClick = (row: Client) => {
    selectedClientId.value = row.id
    updateFormValue.value = {
        name: row.name,
        surname: row.surname,
        phoneNumber: row.phoneNumber,
        email: row.email
    }
    showUpdateModal.value = true
}

const handleUpdateClient = async () => {
    if (!selectedClientId.value) return

    try {
        await updateFormRef.value?.validate()
        updating.value = true

        // Create update payload with only non-empty values
        const updateData: UpdateClientForm = {}
        if (updateFormValue.value.name) updateData.name = updateFormValue.value.name
        if (updateFormValue.value.surname) updateData.surname = updateFormValue.value.surname
        if (updateFormValue.value.phoneNumber) updateData.phoneNumber = updateFormValue.value.phoneNumber
        if (updateFormValue.value.email) updateData.email = updateFormValue.value.email

        console.log('Sending update request:', {
            url: `/client/${selectedClientId.value}`,
            data: updateData
        })

        const response = await api.patch(`/client/${selectedClientId.value}`, updateData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Update response:', response.data)

        // Update the client in the list
        const index = clients.value.findIndex(client => client.id === selectedClientId.value)
        if (index !== -1) {
            clients.value[index] = response.data.client
        }

        message.success('Клиент успешно обновлен')
        showUpdateModal.value = false
        selectedClientId.value = null
    } catch (error: any) {
        console.error('Error updating client:', error)
        if (error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
            message.error('Не удалось обновить клиента: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            console.error('Error request:', error.request)
            message.error('Нет ответа от сервера. Проверьте подключение.')
        } else {
            console.error('Error message:', error.message)
            message.error('Не удалось обновить клиента: ' + error.message)
        }
    } finally {
        updating.value = false
    }
}

const handleCreateClient = async () => {
    try {
        await createFormRef.value?.validate()
        creating.value = true

        const response = await api.post('/client/', createFormValue.value)

        // Add the new client to the list
        clients.value.push(response.data.client)

        message.success('Клиент успешно создан')
        showCreateModal.value = false

        // Reset form
        createFormValue.value = {
            name: '',
            surname: '',
            phoneNumber: '',
            email: ''
        }
    } catch (error: any) {
        console.error('Error creating client:', error)
        if (error.response) {
            message.error('Не удалось создать клиента: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            message.error('Нет ответа от сервера. Проверьте подключение.')
        } else {
            message.error('Не удалось создать клиента: ' + error.message)
        }
    } finally {
        creating.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const rowProps = (row: Client) => {
    return {
        style: 'cursor: pointer',
        onClick: () => handleRowClick(row)
    }
}

// Add new refs for search functionality
const showSearchModal = ref(false)
const searchFormRef = ref<FormInst | null>(null)
const searchForm = ref({
    name: '',
    surname: '',
    phoneNumber: '',
    email: ''
})

// Add computed properties for autocomplete options
const nameOptions = computed(() => {
    const names = new Set(clients.value.map(client => client.name))
    return Array.from(names).filter(name =>
        name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    )
})

const surnameOptions = computed(() => {
    const surnames = new Set(clients.value.map(client => client.surname))
    return Array.from(surnames).filter(surname =>
        surname.toLowerCase().includes(searchForm.value.surname.toLowerCase())
    )
})

const phoneOptions = computed(() => {
    const phones = new Set(clients.value.map(client => client.phoneNumber))
    return Array.from(phones).filter(phone =>
        phone.includes(searchForm.value.phoneNumber)
    )
})

const emailOptions = computed(() => {
    const emails = new Set(clients.value.map(client => client.email))
    return Array.from(emails).filter(email =>
        email.toLowerCase().includes(searchForm.value.email.toLowerCase())
    )
})

// Add computed property for filtered clients
const filteredClients = computed(() => {
    return clients.value.filter(client => {
        const nameMatch = !searchForm.value.name ||
            client.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
        const surnameMatch = !searchForm.value.surname ||
            client.surname.toLowerCase().includes(searchForm.value.surname.toLowerCase())
        const phoneMatch = !searchForm.value.phoneNumber ||
            client.phoneNumber.includes(searchForm.value.phoneNumber)
        const emailMatch = !searchForm.value.email ||
            client.email.toLowerCase().includes(searchForm.value.email.toLowerCase())

        return nameMatch && surnameMatch && phoneMatch && emailMatch
    })
})

// Add function to clear search
const clearSearch = () => {
    searchForm.value = {
        name: '',
        surname: '',
        phoneNumber: '',
        email: ''
    }
}

onMounted(() => {
    fetchClients()
})
</script>

<style scoped>
.n-card {
    height: 100%;
}

:deep(.n-auto-complete) {
    width: 100%;
}
</style>