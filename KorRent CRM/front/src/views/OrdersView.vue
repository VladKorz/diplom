<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Заказы</h1>
                <n-flex align="center" gap="16">

                    <n-button type="error" @click="handleLogout">
                        Выйти
                    </n-button>
                </n-flex>
            </n-flex>
        </div>
    </div>

    <div class="flex flex-col h-full">
        <!-- Main Content -->
        <div class="flex-1 overflow-auto">
            <n-card>
                <n-tabs type="line" animated>
                    <!-- Product Orders Tab -->
                    <n-tab-pane name="products" tab="Заказы товаров">
                        <n-data-table :columns="productColumns" :data="productOrders" :loading="productLoading"
                            :pagination="pagination" />
                    </n-tab-pane>

                    <!-- Service Orders Tab -->
                    <n-tab-pane name="services" tab="Заказы услуг">
                        <n-data-table :columns="serviceColumns" :data="serviceOrders" :loading="serviceLoading"
                            :pagination="pagination" />
                    </n-tab-pane>
                </n-tabs>
            </n-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NButton, NFlex, useMessage, NTabs, NTabPane, NSelect } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import api from '../api/axios'
import { useRoute, useRouter } from 'vue-router'

interface ProductOrder {
    id: number
    productId: number
    bookingId: number
    isPaid: boolean
    status: string
    price: number
}

interface ServiceOrder {
    id: number
    serviceId: number
    bookingId: number
    isPaid: boolean
    status: string
    price: number
}

interface PaginationInfo {
    total: number
    page: number
    limit: number
    totalPages: number
}

interface ProductOrdersResponse {
    message: string
    orderedProducts: ProductOrder[]
    pagination: PaginationInfo
}

interface ServiceOrdersResponse {
    message: string
    orderedServices: ServiceOrder[]
    pagination: PaginationInfo
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const productOrders = ref<ProductOrder[]>([])
const serviceOrders = ref<ServiceOrder[]>([])
const productLoading = ref(false)
const serviceLoading = ref(false)
const bookingId = ref<number | null>(null)

const pagination = {
    pageSize: 10
}

const productColumns: DataTableColumns<ProductOrder> = [
    {
        title: 'Цена',
        key: 'price',
        render: (row) => h('span', { class: 'amount' }, `₽${row.price?.toLocaleString() || '0'}`)
    },
    {
        title: 'Статус',
        key: 'status',
        render: (row) => h(
            NSelect,
            {
                value: row.status,
                options: [
                    { label: 'В ожидании', value: 'pending' },
                    { label: 'Выполнен', value: 'done' }
                ],
                onUpdateValue: (value: 'pending' | 'done') => handleProductStatusUpdate(row, value)
            }
        )
    },
    {
        title: 'Статус оплаты',
        key: 'isPaid',
        render: (row) => h('span', {
            class: `px-2 py-1 rounded text-sm font-medium ${row.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
        }, row.isPaid ? 'Оплачен' : 'Не оплачен')
    }
]

const serviceColumns: DataTableColumns<ServiceOrder> = [
    {
        title: 'Цена',
        key: 'price',
        render: (row) => h('span', { class: 'amount' }, `₽${row.price?.toLocaleString() || '0'}`)
    },
    {
        title: 'Статус',
        key: 'status',
        render: (row) => h(
            NSelect,
            {
                value: row.status,
                options: [
                    { label: 'В ожидании', value: 'pending' },
                    { label: 'Выполнен', value: 'done' }
                ],
                onUpdateValue: (value: 'pending' | 'done') => handleStatusUpdate(row, value)
            }
        )
    },
    {
        title: 'Статус оплаты',
        key: 'isPaid',
        render: (row) => h('span', {
            class: `px-2 py-1 rounded text-sm font-medium ${row.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`
        }, row.isPaid ? 'Оплачен' : 'Не оплачен')
    }
]

const fetchProductOrders = async () => {
    try {
        productLoading.value = true
        const url = bookingId.value
            ? `/product/booking/${bookingId.value}/orders`
            : '/product/orders'
        console.log('Fetching product orders from:', url)
        const response = await api.get<ProductOrdersResponse>(url)
        console.log('Product orders response:', response.data)
        productOrders.value = response.data.orderedProducts
        console.log('Updated productOrders:', productOrders.value)
    } catch (error: any) {
        console.error('Error fetching product orders:', error)
        message.error('Не удалось загрузить заказы товаров: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        productLoading.value = false
    }
}

const fetchServiceOrders = async () => {
    try {
        serviceLoading.value = true
        const url = bookingId.value
            ? `/service/booking/${bookingId.value}/orders`
            : '/service/orders'
        const response = await api.get<ServiceOrdersResponse>(url)
        serviceOrders.value = response.data.orderedServices
    } catch (error: any) {
        console.error('Error fetching service orders:', error)
        message.error('Не удалось загрузить заказы услуг: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    } finally {
        serviceLoading.value = false
    }
}

const handleCancelProductOrder = async (order: ProductOrder) => {
    try {
        await api.post(`/product/order/${order.id}/cancel`, {
            bookingId: order.bookingId,
            productId: order.productId
        })
        message.success('Заказ товара успешно отменен')
        await fetchProductOrders()
    } catch (error: any) {
        console.error('Error cancelling product order:', error)
        message.error('Не удалось отменить заказ товара: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

const handleCancelServiceOrder = async (order: ServiceOrder) => {
    try {
        await api.post(`/service/order/${order.id}/cancel`, {
            bookingId: order.bookingId,
            serviceId: order.serviceId
        })
        message.success('Заказ услуги успешно отменен')
        await fetchServiceOrders()
    } catch (error: any) {
        console.error('Error cancelling service order:', error)
        message.error('Не удалось отменить заказ услуги: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

const handleProductPayClick = async (order: ProductOrder) => {
    try {
        await api.post(`/product/order/${order.id}/pay`, {
            bookingId: order.bookingId,
            productId: order.productId,
            amount: order.price
        })
        message.success('Оплата прошла успешно')
        await fetchProductOrders()
    } catch (error: any) {
        console.error('Error processing payment:', error)
        message.error('Не удалось обработать оплату: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

const handleServicePayClick = async (order: ServiceOrder) => {
    try {
        await api.post(`/service/order/${order.id}/pay`, {
            bookingId: order.bookingId,
            serviceId: order.serviceId,
            amount: order.price
        })
        message.success('Оплата прошла успешно')
        await fetchServiceOrders()
    } catch (error: any) {
        console.error('Error processing payment:', error)
        message.error('Не удалось обработать оплату: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

const handleStatusUpdate = async (order: ServiceOrder, newStatus: 'pending' | 'done') => {
    try {
        await api.patch(`/service/order/${order.id}/status`, {
            serviceId: order.serviceId,
            bookingId: order.bookingId,
            status: newStatus
        })
        message.success('Статус заказа услуги успешно обновлен')
        await fetchServiceOrders()
    } catch (error: any) {
        console.error('Error updating service order status:', error)
        message.error('Не удалось обновить статус заказа услуги: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

const handleProductStatusUpdate = async (order: ProductOrder, newStatus: 'pending' | 'done') => {
    try {
        await api.patch(`/product/order/${order.id}/status`, {
            productId: order.productId,
            bookingId: order.bookingId,
            status: newStatus
        })
        message.success('Статус заказа товара успешно обновлен')
        await fetchProductOrders()
    } catch (error: any) {
        console.error('Error updating product order status:', error)
        message.error('Не удалось обновить статус заказа товара: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'))
    }
}

onMounted(async () => {
    // Get bookingId from route params
    const id = route.params.id
    if (id && typeof id === 'string') {
        bookingId.value = parseInt(id)
    }

    if (bookingId.value !== null) {
        await fetchProductOrders()
        await fetchServiceOrders()
    }
})

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}
</script>

<style scoped>
.amount {
    font-weight: bold;
    color: green;
}
</style>