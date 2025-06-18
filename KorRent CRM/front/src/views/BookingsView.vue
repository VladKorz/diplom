<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Бронирования</h1>
                <n-flex align="center" gap="16">
                    <n-flex align="center" gap="8">
                        <n-date-picker v-model:value="dateRange" type="daterange" clearable
                            @update:value="handleDateRangeChange" class="w-96" />
                    </n-flex>
                    <n-button type="primary" @click="showCreateBookingModal = true">
                        Создать бронирование
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
                <n-data-table :columns="columns" :data="filteredBookings" :loading="loading" :pagination="pagination"
                    :sort-state="sortState"
                    @update:sort-state="(columnKey, order) => sortState = { columnKey, order }" />
            </n-card>
        </div>

        <!-- Booking Details Modal -->
        <n-modal v-model:show="showModal" preset="card" style="width: 700px"
            :title="showEditForm ? 'Редактировать бронирование' : 'Детали бронирования'" :bordered="false" size="huge"
            role="dialog" aria-modal="true" class="booking-modal">
            <n-spin :show="modalLoading">
                <n-space vertical size="large">
                    <!-- Edit Form -->
                    <n-card v-if="showEditForm" size="small" class="info-card">
                        <n-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-placement="left"
                            label-width="auto" require-mark-placement="right-hanging">
                            <n-form-item path="arrivalDate" label="Дата заезда">
                                <n-date-picker v-model:value="editForm.arrivalDate" type="datetime" clearable />
                            </n-form-item>
                            <n-form-item path="departureDate" label="Дата выезда">
                                <n-date-picker v-model:value="editForm.departureDate" type="datetime" clearable />
                            </n-form-item>
                            <n-form-item path="status" label="Статус">
                                <n-select v-model:value="editForm.status" :options="statusOptions" clearable />
                            </n-form-item>
                            <n-form-item path="isPaid" label="Статус оплаты">
                                <n-switch v-model:value="editForm.isPaid" />
                                <span class="ml-2 text-sm text-gray-500">
                                    {{ editForm.isPaid ? 'Оплачено' : 'Не оплачено' }}
                                </span>
                            </n-form-item>
                        </n-form>
                    </n-card>

                    <!-- Booking Information -->
                    <template v-else>
                        <!-- Edit Button -->
                        <n-flex justify="end">
                            <n-button type="primary" @click="showEditForm = true">
                                Редактировать
                            </n-button>
                        </n-flex>

                        <n-card title="Информация о бронировании" size="small" class="info-card">
                            <n-space vertical>
                                <div class="info-row">
                                    <span class="info-label">Дата заезда</span>
                                    <span class="info-value">{{ selectedBooking?.arrivalDate ? new
                                        Date(selectedBooking.arrivalDate).toLocaleString() : '' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Дата выезда</span>
                                    <span class="info-value">{{ selectedBooking?.departureDate ? new
                                        Date(selectedBooking.departureDate).toLocaleString() : '' }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Статус</span>
                                    <span class="info-value status" :class="selectedBooking?.status">
                                        {{ translateBookingStatus(selectedBooking?.status) }}
                                    </span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Статус оплаты</span>
                                    <span class="info-value payment-status"
                                        :class="{ 'is-paid': selectedBooking?.isPaid }">
                                        {{ selectedBooking?.isPaid ? 'Оплачено' : 'Не оплачено' }}
                                    </span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Общая сумма</span>
                                    <span class="info-value amount">₽{{
                                        selectedBooking?.generalPaymentAmount?.toLocaleString() }}</span>
                                </div>
                            </n-space>
                        </n-card>

                        <!-- Client Information -->
                        <n-card title="Информация о клиенте" size="small" class="info-card">
                            <n-space vertical>
                                <div class="info-row">
                                    <span class="info-label">Имя</span>
                                    <span class="info-value">{{ clientDetails?.name }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Фамилия</span>
                                    <span class="info-value">{{ clientDetails?.surname }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Телефон</span>
                                    <span class="info-value">{{ clientDetails?.phoneNumber }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Email</span>
                                    <span class="info-value">{{ clientDetails?.email }}</span>
                                </div>
                            </n-space>
                        </n-card>

                        <!-- Object Information -->
                        <n-card title="Информация об объекте" size="small" class="info-card">
                            <n-space vertical>
                                <div class="info-row">
                                    <span class="info-label">Название</span>
                                    <span class="info-value">{{ objectDetails?.name }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Описание</span>
                                    <span class="info-value">{{ objectDetails?.description }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Стоимость за час</span>
                                    <span class="info-value amount">₽{{ objectDetails?.costPerHour }}</span>
                                </div>
                            </n-space>
                        </n-card>

                        <!-- Ordered Products -->
                        <n-card size="small" class="info-card">
                            <template #header>
                                <n-flex justify="space-between" align="center">
                                    <span class="text-lg font-semibold">Заказанные товары</span>
                                    <n-button type="primary" @click="showCreateOrderModal = true">
                                        Добавить заказ
                                    </n-button>
                                </n-flex>
                            </template>
                            <n-spin :show="ordersLoading">
                                <n-space vertical>
                                    <n-data-table :columns="orderColumns" :data="orderedProducts"
                                        :pagination="orderPagination" />
                                </n-space>
                            </n-spin>
                        </n-card>

                        <!-- Ordered Services -->
                        <n-card size="small" class="info-card">
                            <template #header>
                                <n-flex justify="space-between" align="center">
                                    <span class="text-lg font-semibold">Заказанные услуги</span>
                                    <n-button type="primary" @click="showCreateServiceModal = true">
                                        Добавить услугу
                                    </n-button>
                                </n-flex>
                            </template>
                            <n-spin :show="servicesLoading">
                                <n-space vertical>
                                    <n-data-table :columns="serviceColumns" :data="orderedServices"
                                        :pagination="orderPagination" />
                                </n-space>
                            </n-spin>
                        </n-card>
                    </template>
                </n-space>
            </n-spin>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showModal = false">Закрыть</n-button>
                    <n-button v-if="showEditForm" type="primary" :loading="updatingBooking" @click="handleEditBooking">
                        Обновить
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Create Order Modal -->
        <n-modal v-model:show="showCreateOrderModal" preset="card" style="width: 500px" title="Создать новый заказ"
            :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-spin :show="productsLoading">
                <n-form ref="createOrderFormRef" :model="createOrderForm" :rules="createOrderRules"
                    label-placement="left" label-width="auto" require-mark-placement="right-hanging">
                    <n-form-item path="productId" label="Товар">
                        <n-select v-model:value="createOrderForm.productId" :options="productOptions"
                            placeholder="Выберите товар" />
                    </n-form-item>
                </n-form>
            </n-spin>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateOrderModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creatingOrder" @click="handleCreateOrder">
                        Создать заказ
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Create Service Order Modal -->
        <n-modal v-model:show="showCreateServiceModal" preset="card" style="width: 500px"
            title="Создать новый заказ услуги" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-spin :show="servicesLoading">
                <n-form ref="createServiceFormRef" :model="createServiceForm" :rules="createServiceRules"
                    label-placement="left" label-width="auto" require-mark-placement="right-hanging">
                    <n-form-item path="serviceId" label="Услуга">
                        <n-select v-model:value="createServiceForm.serviceId" :options="serviceOptions"
                            placeholder="Выберите услугу" />
                    </n-form-item>
                </n-form>
            </n-spin>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateServiceModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creatingService" @click="handleCreateService">
                        Создать заказ услуги
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Pay Modal -->
        <n-modal v-model:show="showPayModal" preset="card" style="width: 500px" title="Оплатить заказ" :bordered="false"
            size="huge" role="dialog" aria-modal="true">
            <n-form ref="payFormRef" :model="payForm" :rules="payRules" label-placement="left" label-width="auto"
                require-mark-placement="right-hanging">
                <n-form-item path="amount" label="Сумма">
                    <n-input-number v-model:value="payForm.amount" :min="0" placeholder="Введите сумму" />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showPayModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="payingOrder" @click="handlePay">
                        Оплатить
                    </n-button>
                </n-flex>
            </template>
        </n-modal>

        <!-- Create Booking Modal -->
        <n-modal v-model:show="showCreateBookingModal" preset="card" style="width: 800px"
            title="Создать новое бронирование" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-spin :show="clientsLoading || objectsLoading">
                <n-space vertical>
                    <n-form ref="createBookingFormRef" :model="createBookingForm" :rules="createBookingRules"
                        label-placement="left" label-width="auto" require-mark-placement="right-hanging">
                        <n-form-item path="arrivalDate" label="Дата заезда">
                            <n-date-picker v-model:value="createBookingForm.arrivalDate" type="datetime" clearable />
                        </n-form-item>
                        <n-form-item path="departureDate" label="Дата выезда">
                            <n-date-picker v-model:value="createBookingForm.departureDate" type="datetime" clearable />
                        </n-form-item>
                    </n-form>

                    <!-- Client Selection -->
                    <n-card title="Выберите клиента" size="small" class="info-card">
                        <n-space vertical>
                            <n-data-table :columns="clientColumns" :data="clients" :pagination="{ pageSize: 5 }" />
                            <div v-if="createBookingForm.clientId" class="selected-item">
                                <span class="text-gray-600">Выбранный клиент:</span>
                                <span class="font-medium">
                                    {{clients.find(c => c.id === createBookingForm.clientId)?.name}}
                                    {{clients.find(c => c.id === createBookingForm.clientId)?.surname}}
                                </span>
                            </div>
                        </n-space>
                    </n-card>

                    <!-- Object Selection -->
                    <n-card title="Выберите объект" size="small" class="info-card">
                        <n-space vertical>
                            <n-data-table :columns="objectColumns" :data="objects" :pagination="{ pageSize: 5 }" />
                            <div v-if="createBookingForm.objectId" class="selected-item">
                                <span class="text-gray-600">Выбранный объект:</span>
                                <span class="font-medium">
                                    {{objects.find(o => o.id === createBookingForm.objectId)?.name}}
                                </span>
                            </div>
                        </n-space>
                    </n-card>
                </n-space>
            </n-spin>
            <template #footer>
                <n-flex justify="end" gap="12">
                    <n-button @click="showCreateBookingModal = false">Отмена</n-button>
                    <n-button type="primary" :loading="creatingBooking" @click="handleCreateBooking">
                        Создать бронирование
                    </n-button>
                </n-flex>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed, watch } from 'vue'
import { NCard, NSpace, NDataTable, NDatePicker, NButton, NFlex, NModal, NDescriptions, NDescriptionsItem, NSpin, NSelect, NForm, NFormItem, useMessage, NInputNumber, NTag, NInput, NIcon } from 'naive-ui'
import type { DataTableColumns, FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'
import { Search as SearchIcon } from '@vicons/ionicons5'

interface Booking {
    id: number
    arrivalDate: string
    departureDate: string
    clientId: number
    objectId: number
    generalPaymentAmount: number
    status: string
    isPaid: boolean
}

interface Client {
    id: number
    name: string
    surname: string
    phoneNumber: string
    email: string
    createdAt: string
    updatedAt: string
}

interface RentObject {
    id: number
    name: string
    description: string
    costPerHour: number
    createdAt: string
    updatedAt: string
}

interface OrderedProduct {
    id: number
    productId: number
    bookingId: number
    isPaid: boolean
    status: string
    price: number
}

interface Product {
    id: number
    name: string
    description: string
    price: number
    createdAt: string
    updatedAt: string
}

interface OrderedService {
    id: number
    serviceId: number
    bookingId: number
    isPaid: boolean
    status: string
    price: number
}

interface Service {
    id: number
    name: string
    description: string
    price: number
    createdAt: string
    updatedAt: string
}

const router = useRouter()
const bookings = ref<Booking[]>([])
const loading = ref(false)
const dateRange = ref<[number, number] | null>(null)
const showModal = ref(false)
const modalLoading = ref(false)
const selectedBooking = ref<Booking | null>(null)
const clientDetails = ref<Client | null>(null)
const objectDetails = ref<RentObject | null>(null)
const orderedProducts = ref<OrderedProduct[]>([])
const ordersLoading = ref(false)
const showCreateOrderModal = ref(false)
const productsLoading = ref(false)
const creatingOrder = ref(false)
const products = ref<Product[]>([])
const createOrderFormRef = ref<FormInst | null>(null)
const message = useMessage()
const orderedServices = ref<OrderedService[]>([])
const servicesLoading = ref(false)
const showCreateServiceModal = ref(false)
const creatingService = ref(false)
const services = ref<Service[]>([])
const createServiceFormRef = ref<FormInst | null>(null)
const showCreateBookingModal = ref(false)
const creatingBooking = ref(false)
const createBookingFormRef = ref<FormInst | null>(null)
const clients = ref<Client[]>([])
const objects = ref<RentObject[]>([])
const clientsLoading = ref(false)
const objectsLoading = ref(false)
const showEditForm = ref(false)
const editFormRef = ref<FormInst | null>(null)
const updatingBooking = ref(false)

const pagination = {
    pageSize: 10
}

const orderPagination = {
    pageSize: 3
}

const columns: DataTableColumns<Booking> = [
    {
        title: 'Дата заезда',
        key: 'arrivalDate',
        sorter: 'default',
        render: (row) => new Date(row.arrivalDate).toLocaleString()
    },
    {
        title: 'Дата выезда',
        key: 'departureDate',
        sorter: 'default',
        render: (row) => new Date(row.departureDate).toLocaleString()
    },
    {
        title: 'Сумма платежа',
        key: 'generalPaymentAmount',
        sorter: 'default',
        render: (row) => h('span', { class: 'amount' }, `₽${row.generalPaymentAmount?.toLocaleString() || '0'}`)
    },
    {
        title: 'Статус',
        key: 'status',
        sorter: 'default',
        render: (row) => {
            let type: 'default' | 'error' | 'warning' | 'success' | 'info' | 'primary' = 'default'
            let text = `Статус: ${row.status}`

            switch (row.status) {
                case 'pending':
                    type = 'warning'
                    text = 'В ожидании'
                    break
                case 'confirmed':
                    type = 'success'
                    text = 'Подтвержден'
                    break
                case 'cancelled':
                    type = 'error'
                    text = 'Отменен'
                    break
                case 'completed':
                    type = 'info'
                    text = 'Завершен'
                    break
            }

            return h(NTag, {
                type,
                size: 'small',
                bordered: false
            }, { default: () => text })
        }
    },
    {
        title: 'Статус оплаты',
        key: 'isPaid',
        sorter: 'default',
        render: (row) => h(NTag, {
            type: row.isPaid ? 'success' : 'error',
            size: 'small',
            bordered: false
        }, { default: () => row.isPaid ? 'Оплачено' : 'Не оплачено' })
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
                                onClick: () => showBookingDetails(row)
                            },
                            { default: () => 'Просмотр деталей' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'info',
                                onClick: () => {
                                    selectedBooking.value = row
                                    editForm.value = {
                                        arrivalDate: new Date(row.arrivalDate).getTime(),
                                        departureDate: new Date(row.departureDate).getTime(),
                                        status: row.status,
                                        isPaid: row.isPaid
                                    }
                                    showEditForm.value = true
                                    showModal.value = true
                                }
                            },
                            { default: () => 'Редактировать' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'default',
                                onClick: () => {
                                    router.push(`/orders/${row.id}`);
                                }
                            },
                            { default: () => 'Заказы' }
                        )
                    ]
                }
            )
        }
    }
]

const orderColumns: DataTableColumns<OrderedProduct> = [
    {
        title: 'Сумма',
        key: 'price',
        render: (row) => h('span', { class: 'amount' }, `₽${row.price.toLocaleString()}`)
    },
    {
        title: 'Статус',
        key: 'status',
        render: (row) => h(
            NSelect,
            {
                size: 'small',
                value: row.status,
                options: [
                    { label: 'Ожидается', value: 'pending' },
                    { label: 'Выполнено', value: 'done' }
                ],
                disabled: row.status === 'cancelled',
                onUpdateValue: (value) => handleStatusUpdate(row, value)
            }
        )
    },
    {
        title: 'Статус оплаты',
        key: 'isPaid',
        render: (row) => h('span', {
            class: `px-2 py-1 rounded text-sm font-medium ${row.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`
        }, row.isPaid ? 'Оплачено' : 'Не оплачено')
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
                                type: 'error',
                                disabled: row.status === 'cancelled',
                                onClick: () => handleCancelOrder(row)
                            },
                            { default: () => 'Отменить' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'success',
                                disabled: row.isPaid,
                                onClick: () => handlePayClick(row)
                            },
                            { default: () => 'Оплатить' }
                        )
                    ]
                }
            )
        }
    }
]

const createOrderForm = ref({
    productId: null as number | null
})

const createOrderRules: FormRules = {
    productId: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите товар',
        trigger: 'blur'
    }
}

const productOptions = computed(() => {
    return products.value.map(product => ({
        label: `${product.name} - $${product.price}`,
        value: product.id
    }))
})

const showPayModal = ref(false)
const payingOrder = ref(false)
const selectedOrder = ref<OrderedProduct | null>(null)
const selectedServiceOrder = ref<OrderedService | null>(null)
const payFormRef = ref<FormInst | null>(null)

const payForm = ref({
    amount: 0
})

const payRules: FormRules = {
    amount: {
        required: true,
        type: 'number',
        min: 0,
        message: 'Пожалуйста, введите действительную сумму',
        trigger: 'blur'
    }
}

const serviceColumns: DataTableColumns<OrderedService> = [
    {
        title: 'Сумма',
        key: 'price',
        render: (row) => h('span', { class: 'amount' }, `₽${row.price.toLocaleString()}`)
    },
    {
        title: 'Статус',
        key: 'status',
        render: (row) => h(
            NSelect,
            {
                size: 'small',
                value: row.status,
                options: [
                    { label: 'Ожидается', value: 'pending' },
                    { label: 'Выполнено', value: 'done' }
                ],
                disabled: row.status === 'cancelled',
                onUpdateValue: (value) => handleServiceStatusUpdate(row, value)
            }
        )
    },
    {
        title: 'Статус оплаты',
        key: 'isPaid',
        render: (row) => h('span', {
            class: `px-2 py-1 rounded text-sm font-medium ${row.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`
        }, row.isPaid ? 'Оплачено' : 'Не оплачено')
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
                                type: 'error',
                                disabled: row.status === 'cancelled',
                                onClick: () => handleCancelService(row)
                            },
                            { default: () => 'Отменить' }
                        ),
                        h(
                            NButton,
                            {
                                size: 'small',
                                type: 'success',
                                disabled: row.isPaid,
                                onClick: () => handleServicePayClick(row)
                            },
                            { default: () => 'Оплатить' }
                        )
                    ]
                }
            )
        }
    }
]

const createServiceForm = ref({
    serviceId: null as number | null
})

const createServiceRules: FormRules = {
    serviceId: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите услугу',
        trigger: 'blur'
    }
}

const serviceOptions = computed(() => {
    return services.value.map(service => ({
        label: `${service.name} - $${service.price}`,
        value: service.id
    }))
})

const createBookingForm = ref({
    arrivalDate: null as number | null,
    departureDate: null as number | null,
    clientId: null as number | null,
    objectId: null as number | null
})

const createBookingRules: FormRules = {
    arrivalDate: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите дату заезда',
        trigger: 'blur'
    },
    departureDate: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите дату выезда',
        trigger: 'blur'
    },
    clientId: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите клиента',
        trigger: 'blur'
    },
    objectId: {
        required: true,
        type: 'number',
        message: 'Пожалуйста, выберите объект',
        trigger: 'blur'
    }
}

const clientOptions = computed(() => {
    return clients.value.map(client => ({
        label: `${client.name} ${client.surname} (${client.phoneNumber}, ${client.email})`,
        value: client.id
    }))
})

const objectOptions = computed(() => {
    return objects.value.map(object => ({
        label: `${object.name} - ${object.description} (₽${object.costPerHour}/час)`,
        value: object.id
    }))
})

const clientColumns: DataTableColumns<Client> = [
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
    },
    {
        title: 'Действия',
        key: 'actions',
        render: (row) => {
            return h(
                NButton,
                {
                    size: 'small',
                    type: 'primary',
                    onClick: () => {
                        createBookingForm.value.clientId = row.id
                    }
                },
                { default: () => 'Выбрать' }
            )
        }
    }
]

const objectColumns: DataTableColumns<RentObject> = [
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
        render: (row) => h('span', { class: 'amount' }, `₽${row.costPerHour.toLocaleString()}`)
    },
    {
        title: 'Действия',
        key: 'actions',
        render: (row) => {
            return h(
                NButton,
                {
                    size: 'small',
                    type: 'primary',
                    onClick: () => {
                        createBookingForm.value.objectId = row.id
                    }
                },
                { default: () => 'Выбрать' }
            )
        }
    }
]

const editForm = ref({
    arrivalDate: null as number | null,
    departureDate: null as number | null,
    status: null as string | null,
    isPaid: false
})

const editFormRules: FormRules = {
    arrivalDate: {
        type: 'number',
        message: 'Пожалуйста, выберите действительную дату',
        trigger: 'blur'
    },
    departureDate: {
        type: 'number',
        message: 'Пожалуйста, выберите действительную дату',
        trigger: 'blur'
    },
    status: {
        type: 'string',
        message: 'Пожалуйста, выберите действительный статус',
        trigger: 'blur'
    }
}

const statusOptions = [
    { label: 'Ожидается', value: 'pending' },
    { label: 'Подтверждено', value: 'confirmed' },
    { label: 'Отменено', value: 'cancelled' }
]

// Load saved date range from localStorage
const loadSavedDateRange = () => {
    const savedStartDate = localStorage.getItem('bookingsStartDate')
    const savedEndDate = localStorage.getItem('bookingsEndDate')

    if (savedStartDate && savedEndDate) {
        dateRange.value = [parseInt(savedStartDate), parseInt(savedEndDate)]
        return true
    }
    return false
}

// Save date range to localStorage
const saveDateRange = (start: number, end: number) => {
    localStorage.setItem('bookingsStartDate', start.toString())
    localStorage.setItem('bookingsEndDate', end.toString())
}

// Add computed property for date ranges with correct typing
const dateRanges = computed(() => {
    if (!dateRange.value) {
        return {} as Record<string, [number, number]>
    }

    const [start, end] = dateRange.value
    return {
        'Выбранный период': [start, end] as [number, number]
    } as Record<string, [number, number]>
})

// Update the date range handler
const handleDateRangeChange = (value: [number, number] | null) => {
    if (value) {
        const [start, end] = value
        const startDate = new Date(start).toISOString()
        const endDate = new Date(end).toISOString()
        console.log('Date range changed:', { startDate, endDate })
        saveDateRange(start, end)
        fetchBookings(startDate, endDate)
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

const handleCreateOrder = async () => {
    if (!selectedBooking.value) return

    try {
        await createOrderFormRef.value?.validate()
        creatingOrder.value = true

        const response = await api.post('/product/order', {
            productId: createOrderForm.value.productId,
            bookingId: selectedBooking.value.id
        })

        // Refresh the ordered products list
        await fetchOrderedProducts(selectedBooking.value.id)

        message.success('Заказ создан успешно')
        showCreateOrderModal.value = false
        createOrderForm.value.productId = null
    } catch (error: any) {
        console.error('Error creating order:', error)
        message.error('Не удалось создать заказ: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        creatingOrder.value = false
    }
}

const handleCancelOrder = async (order: OrderedProduct) => {
    if (!selectedBooking.value) return

    try {
        const response = await api.post(`/product/order/${order.id}/cancel`, {
            bookingId: selectedBooking.value.id,
            productId: order.productId
        })

        // Refresh the ordered products list
        await fetchOrderedProducts(selectedBooking.value.id)
        message.success('Заказ отменен успешно')
    } catch (error: any) {
        console.error('Error cancelling order:', error)
        message.error('Не удалось отменить заказ: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    }
}

const handlePayClick = (order: OrderedProduct) => {
    selectedOrder.value = order
    payForm.value.amount = order.price
    showPayModal.value = true
}

const handlePay = async () => {
    if (!selectedBooking.value) return

    try {
        await payFormRef.value?.validate()
        payingOrder.value = true

        if (selectedOrder.value) {
            // Handle product payment
            const response = await api.post(`/product/order/${selectedOrder.value.id}/pay`, {
                bookingId: selectedBooking.value.id,
                productId: selectedOrder.value.productId,
                amount: payForm.value.amount
            })
            await fetchOrderedProducts(selectedBooking.value.id)
        } else if (selectedServiceOrder.value) {
            // Handle service payment
            const response = await api.post(`/service/order/${selectedServiceOrder.value.id}/pay`, {
                bookingId: selectedBooking.value.id,
                serviceId: selectedServiceOrder.value.serviceId,
                amount: payForm.value.amount
            })
            await fetchOrderedServices(selectedBooking.value.id)
        }

        message.success('Платеж обработан успешно')
        showPayModal.value = false
        selectedOrder.value = null
        selectedServiceOrder.value = null
        payForm.value.amount = 0
    } catch (error: any) {
        console.error('Error processing payment:', error)
        message.error('Не удалось обработать платеж: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        payingOrder.value = false
    }
}

const handleStatusUpdate = async (order: OrderedProduct, newStatus: string) => {
    if (!selectedBooking.value) return

    try {
        const response = await api.patch(`/product/order/${order.id}/status`, {
            bookingId: selectedBooking.value.id,
            productId: order.productId,
            status: newStatus
        })

        // Refresh the ordered products list
        await fetchOrderedProducts(selectedBooking.value.id)
        message.success('Статус обновлен успешно')
    } catch (error: any) {
        console.error('Error updating status:', error)
        message.error('Не удалось обновить статус: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    }
}

const handleCreateService = async () => {
    if (!selectedBooking.value) return

    try {
        await createServiceFormRef.value?.validate()
        creatingService.value = true

        const response = await api.post('/service/order', {
            serviceId: createServiceForm.value.serviceId,
            bookingId: selectedBooking.value.id
        })

        // Refresh the ordered services list
        await fetchOrderedServices(selectedBooking.value.id)

        message.success('Заказ услуги создан успешно')
        showCreateServiceModal.value = false
        createServiceForm.value.serviceId = null
    } catch (error: any) {
        console.error('Error creating service order:', error)
        message.error('Не удалось создать заказ услуги: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        creatingService.value = false
    }
}

const handleCancelService = async (service: OrderedService) => {
    if (!selectedBooking.value) return

    try {
        const response = await api.post(`/service/order/${service.id}/cancel`, {
            bookingId: selectedBooking.value.id,
            serviceId: service.serviceId
        })

        // Refresh the ordered services list
        await fetchOrderedServices(selectedBooking.value.id)
        message.success('Заказ услуги отменен успешно')
    } catch (error: any) {
        console.error('Error cancelling service order:', error)
        message.error('Не удалось отменить заказ услуги: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    }
}

const handleServicePayClick = (service: OrderedService) => {
    selectedServiceOrder.value = service
    payForm.value.amount = service.price
    showPayModal.value = true
}

const handleServiceStatusUpdate = async (service: OrderedService, newStatus: string) => {
    if (!selectedBooking.value) return

    try {
        const response = await api.patch(`/service/order/${service.id}/status`, {
            bookingId: selectedBooking.value.id,
            serviceId: service.serviceId,
            status: newStatus
        })

        // Refresh the ordered services list
        await fetchOrderedServices(selectedBooking.value.id)
        message.success('Статус услуги обновлен успешно')
    } catch (error: any) {
        console.error('Error updating service status:', error)
        message.error('Не удалось обновить статус услуги: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    }
}

const fetchClients = async () => {
    try {
        clientsLoading.value = true
        const response = await api.get('/client/all')
        clients.value = response.data.client
    } catch (error) {
        console.error('Error fetching clients:', error)
        message.error('Не удалось получить клиентов')
    } finally {
        clientsLoading.value = false
    }
}

const fetchObjects = async () => {
    try {
        objectsLoading.value = true
        const response = await api.get('/rentObject/all')
        objects.value = response.data.objects
    } catch (error) {
        console.error('Error fetching objects:', error)
        message.error('Не удалось получить объекты')
    } finally {
        objectsLoading.value = false
    }
}

const handleCreateBooking = async () => {
    try {
        await createBookingFormRef.value?.validate()
        creatingBooking.value = true

        const response = await api.post('/booking/', {
            arrivalDate: new Date(createBookingForm.value.arrivalDate!).toISOString(),
            departureDate: new Date(createBookingForm.value.departureDate!).toISOString(),
            clientId: createBookingForm.value.clientId,
            objectId: createBookingForm.value.objectId
        })

        message.success('Бронирование создано успешно')
        showCreateBookingModal.value = false
        createBookingForm.value = {
            arrivalDate: null,
            departureDate: null,
            clientId: null,
            objectId: null
        }

        // Refresh the bookings list
        if (dateRange.value) {
            const [start, end] = dateRange.value
            const startDate = new Date(start).toISOString()
            const endDate = new Date(end).toISOString()
            await fetchBookings(startDate, endDate)
        }
    } catch (error: any) {
        console.error('Error creating booking:', error)
        message.error('Не удалось создать бронирование: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        creatingBooking.value = false
    }
}

const handleEditBooking = async () => {
    if (!selectedBooking.value) return

    try {
        await editFormRef.value?.validate()
        updatingBooking.value = true

        const updateData: any = {}
        if (editForm.value.arrivalDate) {
            updateData.arrivalDate = new Date(editForm.value.arrivalDate).toISOString()
        }
        if (editForm.value.departureDate) {
            updateData.departureDate = new Date(editForm.value.departureDate).toISOString()
        }
        if (editForm.value.status !== null) {
            updateData.status = editForm.value.status
        }
        if (editForm.value.isPaid !== null) {
            updateData.isPaid = editForm.value.isPaid
        }

        const response = await api.patch(`/booking/${selectedBooking.value.id}`, updateData)

        // Update the local booking data
        if (selectedBooking.value) {
            Object.assign(selectedBooking.value, response.data.booking)
        }

        message.success('Бронирование обновлено успешно')
        showEditForm.value = false

        // Refresh the bookings list
        if (dateRange.value) {
            const [start, end] = dateRange.value
            const startDate = new Date(start).toISOString()
            const endDate = new Date(end).toISOString()
            await fetchBookings(startDate, endDate)
        }
    } catch (error: any) {
        console.error('Error updating booking:', error)
        message.error('Не удалось обновить бронирование: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        updatingBooking.value = false
    }
}

const fetchBookings = async (start: string, end: string) => {
    try {
        loading.value = true
        console.log('Fetching bookings with date range:', { start, end })
        const response = await api.post('/booking/byDateRange', {
            startDate: start,
            endDate: end
        })
        console.log('Bookings response:', response.data)
        if (response.data.bookings) {
            bookings.value = response.data.bookings
        } else {
            console.error('Invalid bookings data format:', response.data)
            message.error('Неверный формат данных получен от сервера')
        }
    } catch (error: any) {
        console.error('Error fetching bookings:', error)
        if (error.response) {
            message.error('Не удалось получить бронирования: ' + (error.response.data?.message || 'Server error'))
        } else if (error.request) {
            message.error('Нет ответа от сервера. Пожалуйста, проверьте ваше подключение.')
        } else {
            message.error('Не удалось получить бронирования: ' + error.message)
        }
    } finally {
        loading.value = false
    }
}

const fetchClientDetails = async (clientId: number) => {
    try {
        const response = await api.get(`/client/${clientId}`)
        clientDetails.value = response.data.client
    } catch (error) {
        console.error('Error fetching client details:', error)
    }
}

const fetchObjectDetails = async (objectId: number) => {
    try {
        const response = await api.get(`/rentObject/${objectId}`)
        objectDetails.value = response.data.object
    } catch (error) {
        console.error('Error fetching object details:', error)
    }
}

const fetchOrderedProducts = async (bookingId: number) => {
    try {
        ordersLoading.value = true
        const response = await api.get(`/product/booking/${bookingId}/orders`)
        orderedProducts.value = response.data.orderedProducts
    } catch (error) {
        console.error('Error fetching ordered products:', error)
    } finally {
        ordersLoading.value = false
    }
}

const fetchOrderedServices = async (bookingId: number) => {
    try {
        servicesLoading.value = true
        const response = await api.get(`/service/booking/${bookingId}/orders`)
        orderedServices.value = response.data.orderedServices
    } catch (error) {
        console.error('Error fetching ordered services:', error)
    } finally {
        servicesLoading.value = false
    }
}

const fetchProducts = async () => {
    try {
        productsLoading.value = true
        const response = await api.get('/product/all')
        products.value = response.data.products
    } catch (error) {
        console.error('Error fetching products:', error)
        message.error('Не удалось получить товары')
    } finally {
        productsLoading.value = false
    }
}

const fetchServices = async () => {
    try {
        servicesLoading.value = true
        const response = await api.get('/service/all')
        services.value = response.data.services
    } catch (error) {
        console.error('Error fetching services:', error)
        message.error('Не удалось получить услуги')
    } finally {
        servicesLoading.value = false
    }
}

const showBookingDetails = async (booking: Booking) => {
    modalLoading.value = true
    showModal.value = true
    selectedBooking.value = booking

    try {
        await Promise.all([
            fetchClientDetails(booking.clientId),
            fetchObjectDetails(booking.objectId),
            fetchOrderedProducts(booking.id),
            fetchOrderedServices(booking.id),
            fetchProducts(),
            fetchServices()
        ])
    } finally {
        modalLoading.value = false
    }
}

// Add watch for modal visibility
watch(showCreateBookingModal, async (newValue) => {
    if (newValue) {
        // Fetch data when modal opens
        await Promise.all([
            fetchClients(),
            fetchObjects()
        ])
    }
})

onMounted(() => {
    // Try to load saved date range first
    const hasSavedRange = loadSavedDateRange()

    if (!hasSavedRange) {
        // Set default date range (last 10 days to next 3 days)
        const end = new Date()
        end.setDate(end.getDate() + 3)
        const start = new Date()
        start.setDate(start.getDate() - 10)

        dateRange.value = [start.getTime(), end.getTime()]

        // Save the default range
        saveDateRange(start.getTime(), end.getTime())
    }

    console.log('Initial date range:', {
        start: new Date(dateRange.value![0]).toISOString(),
        end: new Date(dateRange.value![1]).toISOString()
    })
    fetchBookings(
        new Date(dateRange.value![0]).toISOString(),
        new Date(dateRange.value![1]).toISOString()
    )
})

// Helper function to translate booking status
const translateBookingStatus = (status: string | undefined): string => {
    if (!status) return '';
    switch (status) {
        case 'pending':
            return 'В ожидании';
        case 'confirmed':
            return 'Подтвержден';
        case 'cancelled':
            return 'Отменен';
        case 'completed':
            return 'Завершен';
        default:
            return `Статус: ${status}`;
    }
};

// Remove the custom sorting state and handler since we're using built-in sorting
const sortState = ref<{
    columnKey: string | null
    order: 'ascend' | 'descend' | false
}>({
    columnKey: null,
    order: false
})

// Add search state
const searchQuery = ref('')
const filteredBookings = computed(() => {
    if (!searchQuery.value) return bookings.value

    const query = searchQuery.value.toLowerCase()
    return bookings.value.filter(booking => {
        const arrivalDate = new Date(booking.arrivalDate).toLocaleString().toLowerCase()
        const departureDate = new Date(booking.departureDate).toLocaleString().toLowerCase()
        const status = translateBookingStatus(booking.status).toLowerCase()
        const paymentStatus = booking.isPaid ? 'оплачено' : 'не оплачено'
        const amount = booking.generalPaymentAmount?.toString() || '0'

        return arrivalDate.includes(query) ||
            departureDate.includes(query) ||
            status.includes(query) ||
            paymentStatus.includes(query) ||
            amount.includes(query)
    })
})

// Update the handleSearch function
const handleSearch = (value: string) => {
    searchQuery.value = value
}
</script>

<style scoped>
.n-card {
    height: 100%;
}

.booking-modal :deep(.n-card-header) {
    padding: 16px 20px;
}

.booking-modal :deep(.n-card-header__main) {
    font-size: 1.25rem;
    font-weight: 600;
}

.info-card {
    border-radius: 8px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--n-border-color);
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    color: var(--n-text-color-3);
    font-size: 0.95rem;
    font-weight: 500;
}

.info-value {
    color: var(--n-text-color);
    font-size: 0.95rem;
    font-weight: 400;
}

.amount {
    font-weight: 600;
    color: var(--n-primary-color);
}

.selected-item {
    padding: 8px 16px;
    background-color: var(--n-color-modal);
    border-radius: 4px;
    margin-top: 8px;
}
</style>