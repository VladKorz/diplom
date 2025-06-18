<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Объекты аренды</h1>
                <n-flex align="center" gap="16">
                    <n-flex align="center" gap="8">
                        <n-date-picker v-model:value="dateRange" type="daterange" clearable
                            @update:value="handleDateRangeChange" class="w-96" />
                    </n-flex>
                    <n-button type="primary" @click="() => fetchAvailableObjects()" :loading="availableLoading">
                        Проверить доступность
                    </n-button>
                    <n-button type="primary" @click="showCreateModal = true">
                        Создать объект
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
                <template #header>
                    <n-flex justify="space-between" align="center">
                        <span class="text-lg font-semibold">
                            {{ showAvailableObjects ? 'Доступные объекты' : 'Все объекты' }}
                        </span>
                        <n-button v-if="showAvailableObjects" @click="showAvailableObjects = false">
                            Показать все объекты
                        </n-button>
                    </n-flex>
                </template>
                <n-data-table :columns="columns" :data="showAvailableObjects ? availableObjects : objects"
                    :loading="showAvailableObjects ? availableLoading : loading" :pagination="pagination"
                    @row-click="handleRowClick" :row-props="rowProps" />
            </n-card>
        </div>

        <!-- Create Object Modal -->
        <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px" title="Создать новый объект"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="createFormRef" :model="createFormValue" :rules="rules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="createFormValue.name" placeholder="Введите название объекта" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="createFormValue.description" type="textarea"
                        placeholder="Введите описание объекта" />
                </n-form-item>
                <n-form-item path="costPerHour" label="Стоимость за час">
                    <n-input-number v-model:value="createFormValue.costPerHour" :min="0"
                        placeholder="Введите стоимость за час" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creating" @click="handleCreateObject">
                        Создать объект
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Update Object Modal -->
        <n-modal v-model:show="showUpdateModal" preset="card" style="width: 600px" title="Обновить объект"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="updateFormRef" :model="updateFormValue" :rules="updateRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="updateFormValue.name" placeholder="Введите название объекта" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="updateFormValue.description" type="textarea"
                        placeholder="Введите описание объекта" />
                </n-form-item>
                <n-form-item path="costPerHour" label="Стоимость за час">
                    <n-input-number v-model:value="updateFormValue.costPerHour" :min="0"
                        placeholder="Введите стоимость за час" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showUpdateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updating" @click="handleUpdateObject">
                        Обновить объект
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NFlex, NModal, NForm, NFormItem, NInput, NInputNumber, useMessage, NDatePicker } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

interface RentObject {
    id: number
    name: string
    description: string
    costPerHour: number
    createdAt: string
    updatedAt: string
}

interface UpdateObjectForm {
    name?: string
    description?: string
    costPerHour?: number
}

const router = useRouter()
const message = useMessage()
const objects = ref<RentObject[]>([])
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const showCreateModal = ref(false)
const showUpdateModal = ref(false)
const createFormRef = ref<FormInst | null>(null)
const updateFormRef = ref<FormInst | null>(null)
const selectedObjectId = ref<number | null>(null)
const showAvailableObjects = ref(false)
const availableObjects = ref<RentObject[]>([])
const availableLoading = ref(false)
const dateRange = ref<[number, number] | null>(null)

const createFormValue = ref<UpdateObjectForm>({
    name: '',
    description: '',
    costPerHour: undefined
})

const updateFormValue = ref<UpdateObjectForm>({
    name: '',
    description: '',
    costPerHour: undefined
})

const rules: FormRules = {
    name: {
        required: true,
        message: 'Пожалуйста, введите название объекта',
        trigger: 'blur'
    },
    description: {
        required: true,
        message: 'Пожалуйста, введите описание объекта',
        trigger: 'blur'
    },
    costPerHour: {
        required: true,
        type: 'number',
        min: 0,
        message: 'Пожалуйста, введите корректную стоимость за час',
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
    costPerHour: {
        type: 'number',
        min: 0,
        message: 'Пожалуйста, введите корректную стоимость за час',
        trigger: 'blur'
    }
}

const pagination = {
    pageSize: 10
}

const columns: DataTableColumns<RentObject> = [
    {
        title: 'Название',
        key: 'name'
    },
    {
        title: 'Описание',
        key: 'description'
    },
    {
        title: 'Стоимость за час',
        key: 'costPerHour',
        render: (row) => h('span', { class: 'amount' }, `${row.costPerHour.toLocaleString()} ₽`)
    }
]

const fetchObjects = async () => {
    try {
        loading.value = true
        const response = await api.get('/rentObject/all')
        objects.value = response.data.objects
    } catch (error) {
        console.error('Error fetching objects:', error)
        message.error('Не удалось получить объекты')
    } finally {
        loading.value = false
    }
}

const handleCreateObject = async () => {
    try {
        await createFormRef.value?.validate()
        creating.value = true

        const response = await api.post('/rentObject/', {
            name: createFormValue.value.name,
            description: createFormValue.value.description,
            costPerHour: createFormValue.value.costPerHour
        })

        objects.value.unshift(response.data.object)
        message.success('Объект успешно создан')

        createFormValue.value = {
            name: '',
            description: '',
            costPerHour: undefined
        }
        showCreateModal.value = false
    } catch (error: any) {
        console.error('Error creating object:', error)
        message.error('Не удалось создать объект: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        creating.value = false
    }
}

const handleRowClick = (row: RentObject) => {
    selectedObjectId.value = row.id
    updateFormValue.value = {
        name: row.name,
        description: row.description,
        costPerHour: row.costPerHour
    }
    showUpdateModal.value = true
}

const handleUpdateObject = async () => {
    if (!selectedObjectId.value) return

    try {
        await updateFormRef.value?.validate()
        updating.value = true

        // Create update payload with only non-empty values
        const updateData: UpdateObjectForm = {}
        if (updateFormValue.value.name) updateData.name = updateFormValue.value.name
        if (updateFormValue.value.description) updateData.description = updateFormValue.value.description
        if (updateFormValue.value.costPerHour !== undefined) updateData.costPerHour = updateFormValue.value.costPerHour

        console.log('Sending update request:', {
            url: `/rentObject/${selectedObjectId.value}`,
            data: updateData
        })

        const response = await api.patch(`/rentObject/${selectedObjectId.value}`, updateData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Update response:', response.data)

        // Update the object in the list
        const index = objects.value.findIndex(obj => obj.id === selectedObjectId.value)
        if (index !== -1) {
            objects.value[index] = response.data.object
        }

        message.success('Объект успешно обновлен')
        showUpdateModal.value = false
        selectedObjectId.value = null
    } catch (error: any) {
        console.error('Error updating object:', error)
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
            message.error('Не удалось обновить объект: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request)
            message.error('Нет ответа от сервера. Проверьте подключение.')
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message)
            message.error('Не удалось обновить объект: ' + error.message)
        }
    } finally {
        updating.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const rowProps = (row: RentObject) => {
    return {
        style: 'cursor: pointer',
        onClick: () => handleRowClick(row)
    }
}

const handleDateRangeChange = (value: [number, number] | null) => {
    if (value) {
        const [start, end] = value
        fetchAvailableObjects(start, end)
    }
}

const fetchAvailableObjects = async (start?: number, end?: number) => {
    if (!start || !end) {
        if (!dateRange.value) {
            message.warning('Пожалуйста, выберите даты')
            return
        }
        [start, end] = dateRange.value
    }

    try {
        availableLoading.value = true
        const requestData = {
            arrivalDate: new Date(start).toISOString(),
            departureDate: new Date(end).toISOString()
        }
        console.log('Fetching available objects with data:', requestData)

        const response = await api.post('/rentObject/available', requestData)
        console.log('Available objects response:', response.data)

        if (response.data.availableObjects) {
            availableObjects.value = response.data.availableObjects
            showAvailableObjects.value = true
            message.success('Доступные объекты успешно загружены')
        } else {
            throw new Error('Invalid response format')
        }
    } catch (error: any) {
        console.error('Error fetching available objects:', error)
        if (error.response) {
            message.error('Не удалось получить доступные объекты: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            message.error('Нет ответа от сервера. Проверьте подключение.')
        } else {
            message.error('Не удалось получить доступные объекты: ' + error.message)
        }
    } finally {
        availableLoading.value = false
    }
}

onMounted(() => {
    fetchObjects()
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

.cursor-pointer {
    cursor: pointer;
}
</style>