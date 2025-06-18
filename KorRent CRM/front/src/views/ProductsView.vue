<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Товары</h1>
                <n-flex align="center" gap="16">
                    <n-button type="primary" @click="showCreateModal = true">
                        Создать товар
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
                <n-data-table :columns="columns" :data="products" :loading="loading" :pagination="pagination"
                    @row-click="handleRowClick" :row-props="rowProps" />
            </n-card>
        </div>

        <!-- Create Product Modal -->
        <n-modal v-model:show="showCreateModal" preset="card" style="width: 600px" title="Создать новый товар"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="createFormRef" :model="createFormValue" :rules="createRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="createFormValue.name" placeholder="Введите название товара" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="createFormValue.description" type="textarea"
                        placeholder="Введите описание товара" />
                </n-form-item>
                <n-form-item path="price" label="Цена">
                    <n-input-number v-model:value="createFormValue.price" :min="0" placeholder="Введите цену товара" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creating" @click="handleCreateProduct">
                        Создать товар
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Update Product Modal -->
        <n-modal v-model:show="showUpdateModal" preset="card" style="width: 600px" title="Обновить товар"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-form ref="updateFormRef" :model="updateFormValue" :rules="updateRules" label-placement="left"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item path="name" label="Название">
                    <n-input v-model:value="updateFormValue.name" placeholder="Введите название товара" />
                </n-form-item>
                <n-form-item path="description" label="Описание">
                    <n-input v-model:value="updateFormValue.description" type="textarea"
                        placeholder="Введите описание товара" />
                </n-form-item>
                <n-form-item path="price" label="Цена">
                    <n-input-number v-model:value="updateFormValue.price" :min="0" placeholder="Введите цену товара" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showUpdateModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="updating" @click="handleUpdateProduct">
                        Обновить товар
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

interface Product {
    id: number
    name: string
    description: string
    price: number
    createdAt: string
    updatedAt: string
}

interface CreateProductForm {
    name: string
    description: string
    price: number
}

interface UpdateProductForm {
    name?: string
    description?: string
    price?: number
}

const router = useRouter()
const message = useMessage()
const products = ref<Product[]>([])
const loading = ref(false)
const creating = ref(false)
const updating = ref(false)
const showCreateModal = ref(false)
const showUpdateModal = ref(false)
const createFormRef = ref<FormInst | null>(null)
const updateFormRef = ref<FormInst | null>(null)
const selectedProductId = ref<number | null>(null)

const createFormValue = ref<CreateProductForm>({
    name: '',
    description: '',
    price: 0
})

const updateFormValue = ref<UpdateProductForm>({
    name: '',
    description: '',
    price: undefined
})

const createRules: FormRules = {
    name: {
        required: true,
        message: 'Пожалуйста, введите название товара',
        trigger: 'blur'
    },
    description: {
        required: true,
        message: 'Пожалуйста, введите описание товара',
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

const columns: DataTableColumns<Product> = [
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

const fetchProducts = async () => {
    try {
        loading.value = true
        const response = await api.get('/product/all')
        products.value = response.data.products
    } catch (error) {
        console.error('Error fetching products:', error)
        message.error('Не удалось получить товары')
    } finally {
        loading.value = false
    }
}

const handleCreateProduct = async () => {
    try {
        await createFormRef.value?.validate()
        creating.value = true

        const response = await api.post('/product/', {
            name: createFormValue.value.name,
            description: createFormValue.value.description,
            price: createFormValue.value.price
        })

        products.value.unshift(response.data.product)
        message.success('Товар успешно создан')

        createFormValue.value = {
            name: '',
            description: '',
            price: 0
        }
        showCreateModal.value = false
    } catch (error: any) {
        console.error('Error creating product:', error)
        message.error('Не удалось создать товар: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        creating.value = false
    }
}

const handleRowClick = (row: Product) => {
    selectedProductId.value = row.id
    updateFormValue.value = {
        name: row.name,
        description: row.description,
        price: row.price
    }
    showUpdateModal.value = true
}

const handleUpdateProduct = async () => {
    if (!selectedProductId.value) return

    try {
        await updateFormRef.value?.validate()
        updating.value = true

        // Create update payload with only non-empty values
        const updateData: UpdateProductForm = {}
        if (updateFormValue.value.name) updateData.name = updateFormValue.value.name
        if (updateFormValue.value.description) updateData.description = updateFormValue.value.description
        if (updateFormValue.value.price !== undefined) updateData.price = updateFormValue.value.price

        console.log('Sending update request:', {
            url: `/product/${selectedProductId.value}`,
            data: updateData
        })

        const response = await api.patch(`/product/${selectedProductId.value}`, updateData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })

        console.log('Update response:', response.data)

        // Update the product in the list
        const index = products.value.findIndex(product => product.id === selectedProductId.value)
        if (index !== -1) {
            products.value[index] = response.data.product
        }

        message.success('Товар успешно обновлен')
        showUpdateModal.value = false
        selectedProductId.value = null
    } catch (error: any) {
        console.error('Error updating product:', error)
        if (error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error response status:', error.response.status)
            message.error('Не удалось обновить товар: ' + (error.response.data?.message || 'Ошибка сервера'))
        } else if (error.request) {
            console.error('Error request:', error.request)
            message.error('Не получен ответ от сервера. Пожалуйста, проверьте соединение.')
        } else {
            console.error('Error message:', error.message)
            message.error('Не удалось обновить товар: ' + error.message)
        }
    } finally {
        updating.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const rowProps = (row: Product) => {
    return {
        style: 'cursor: pointer',
        onClick: () => handleRowClick(row)
    }
}

onMounted(() => {
    fetchProducts()
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