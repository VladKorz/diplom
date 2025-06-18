<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Услуги</h1>
                <n-flex align="center" gap="16">
                    <n-button type="primary" @click="showCreateModal = true">
                        Создать услугу
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
                <n-data-table :columns="columns" :data="services" :loading="loading" :pagination="pagination"
                    @row-click="handleRowClick" :row-props="rowProps" />
            </n-card>
        </div>

        <!-- Create Service Modal -->
        <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px" title="Создать новую услугу"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="createFormRef" :model="createFormValue" :rules="createRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="createFormValue.name" placeholder="Введите название услуги" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="createFormValue.description" type="textarea"
                        placeholder="Введите описание услуги" />
                </n-form-item>
                <n-form-item path="price" label="Цена">
                    <n-input-number v-model:value="createFormValue.price" :min="0" placeholder="Введите цену услуги" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creating" @click="handleCreateService">
                        Создать услугу
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Update Service Modal -->
        <n-modal v-model:show="showUpdateModal" preset="card" style="width: 600px" title="Обновить услугу"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="updateFormRef" :model="updateFormValue" :rules="updateRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="updateFormValue.name" placeholder="Введите название услуги" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="updateFormValue.description" type="textarea"
                        placeholder="Введите описание услуги" />
                </n-form-item>
                <n-form-item path="price" label="Цена">
                    <n-input-number v-model:value="updateFormValue.price" :min="0" placeholder="Введите цену услуги" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showUpdateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updating" @click="handleUpdateService">
                        Обновить услугу
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NFlex, NModal, NForm, NFormItem, NInput, NInputNumber, useMessage } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

interface Service {
    id: number
    name: string
    description: string
    price: number
    createdAt: string
    updatedAt: string
}

interface CreateServiceForm {
    name: string
    description: string
    price: number
}

interface UpdateServiceForm {
    name?: string
    description?: string
    price?: number
}

const router = useRouter()
const message = useMessage()
const services = ref<Service[]>([])
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const showCreateModal = ref(false)
const showUpdateModal = ref(false)
const createFormRef = ref<FormInst | null>(null)
const updateFormRef = ref<FormInst | null>(null)
const selectedServiceId = ref<number | null>(null)

const createFormValue = ref<CreateServiceForm>({
    name: '',
    description: '',
    price: 0
})

const updateFormValue = ref<UpdateServiceForm>({
    name: '',
    description: '',
    price: undefined
})

const createRules: FormRules = {
    name: {
        required: true,
        message: 'Пожалуйста, введите название услуги',
        trigger: 'blur'
    },
    description: {
        required: true,
        message: 'Пожалуйста, введите описание услуги',
        trigger: 'blur'
    },
    price: {
        required: true,
        type: 'number',
        min: 0,
        message: 'Пожалуйста, введите корректную цену',
        trigger: 'blur'
    }
}

const updateRules: FormRules = {
    name: {
        type: 'string',
        message: 'Пожалуйста, введите корректное название',
        trigger: 'blur'
    },
    description: {
        type: 'string',
        message: 'Пожалуйста, введите корректное описание',
        trigger: 'blur'
    },
    price: {
        type: 'number',
        min: 0,
        message: 'Пожалуйста, введите корректную цену',
        trigger: 'blur'
    }
}

const pagination = {
    pageSize: 10
}

const columns: DataTableColumns<Service> = [
    {
        title: 'Название',
        key: 'name',
        sorter: 'default'
    },
    {
        title: 'Описание',
        key: 'description',
        sorter: 'default'
    },
    {
        title: 'Цена',
        key: 'price',
        sorter: 'default',
        render: (row) => h('span', { class: 'amount' }, `${row.price.toLocaleString()} ₽`)
    }
]

const fetchServices = async () => {
    try {
        loading.value = true
        const response = await api.get('/service/all')
        services.value = response.data.services
    } catch (error) {
        console.error('Error fetching services:', error)
        message.error('Не удалось получить услуги')
    } finally {
        loading.value = false
    }
}

const handleCreateService = async () => {
    try {
        await createFormRef.value?.validate()
        creating.value = true

        const response = await api.post('/service/', {
            name: createFormValue.value.name,
            description: createFormValue.value.description,
            price: createFormValue.value.price
        })

        services.value.unshift(response.data.service)
        message.success('Услуга успешно создана')

        createFormValue.value = {
            name: '',
            description: '',
            price: 0
        }
        showCreateModal.value = false
    } catch (error: any) {
        console.error('Error creating service:', error)
        message.error('Не удалось создать услугу: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        creating.value = false
    }
}

const handleRowClick = (row: Service) => {
    selectedServiceId.value = row.id
    updateFormValue.value = {
        name: row.name,
        description: row.description,
        price: row.price
    }
    showUpdateModal.value = true
}

const handleUpdateService = async () => {
    if (!selectedServiceId.value) return

    try {
        await updateFormRef.value?.validate()
        updating.value = true

        // Create update payload with only non-empty values
        const updateData: UpdateServiceForm = {}
        if (updateFormValue.value.name) updateData.name = updateFormValue.value.name
        if (updateFormValue.value.description) updateData.description = updateFormValue.value.description
        if (updateFormValue.value.price !== undefined) updateData.price = updateFormValue.value.price

        console.log('Sending update request:', {
            url: `/service/${selectedServiceId.value}`,
            data: updateData
        })

        const response = await api.patch(`/service/${selectedServiceId.value}`, updateData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Update response:', response.data)

        // Update the service in the list
        const index = services.value.findIndex(service => service.id === selectedServiceId.value)
        if (index !== -1) {
            services.value[index] = response.data.service
        }

        message.success('Услуга успешно обновлена')
        showUpdateModal.value = false
        selectedServiceId.value = null
    } catch (error: any) {
        console.error('Error updating service:', error)
        if (error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
            message.error('Не удалось обновить услугу: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            console.error('Error request:', error.request)
            message.error('Не получен ответ от сервера. Пожалуйста, проверьте соединение.')
        } else {
            console.error('Error message:', error.message)
            message.error('Не удалось обновить услугу: ' + error.message)
        }
    } finally {
        updating.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const rowProps = (row: Service) => {
    return {
        style: 'cursor: pointer',
        onClick: () => handleRowClick(row)
    }
}

onMounted(() => {
    fetchServices()
})
</script>

<style scoped>
.n-card {
    height: 100%;
}

.amount {
    font-weight: 600;
    color: #2c5282;
}
</style>