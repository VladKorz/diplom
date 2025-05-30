<template>
    <div class="flex flex-col h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Create New Booking</h1>
                <n-flex align="center" gap="16">
                    <n-button type="primary" @click="router.push('/admin')">
                        Admin Panel
                    </n-button>
                    <n-button type="primary" @click="router.push('/bookings')">
                        View Bookings
                    </n-button>
                    <n-button type="error" @click="handleLogout">
                        Logout
                    </n-button>
                </n-flex>
            </n-flex>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-4 overflow-auto">
            <n-card>
                <n-form ref="formRef" :model="formValue" :rules="rules" label-placement="left" label-width="auto"
                    require-mark-placement="right-hanging">
                    <n-form-item path="objectId" label="Rent Object">
                        <n-select v-model:value="formValue.objectId" :options="objectOptions"
                            placeholder="Select object" />
                    </n-form-item>
                    <n-form-item path="arrivalDate" label="Arrival Date">
                        <n-date-picker v-model:value="formValue.arrivalDate" type="datetime" clearable />
                    </n-form-item>
                    <n-form-item path="departureDate" label="Departure Date">
                        <n-date-picker v-model:value="formValue.departureDate" type="datetime" clearable />
                    </n-form-item>
                    <n-form-item path="status" label="Status">
                        <n-select v-model:value="formValue.status" :options="statusOptions"
                            placeholder="Select status" />
                    </n-form-item>
                    <n-form-item path="isPaid" label="Payment Status">
                        <n-switch v-model:value="formValue.isPaid" />
                    </n-form-item>
                </n-form>
                <template #footer>
                    <n-flex justify="end" gap="12">
                        <n-button @click="router.push('/bookings')">Cancel</n-button>
                        <n-button type="primary" :loading="creating" @click="handleCreateBooking">
                            Create Booking
                        </n-button>
                    </n-flex>
                </template>
            </n-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NButton, NFlex, NForm, NFormItem, NInput, NDatePicker, NSelect, NSwitch, useMessage } from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

interface RentObject {
    id: number
    name: string
    description: string
    costPerHour: number
}

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const creating = ref(false)
const objects = ref<RentObject[]>([])

const formValue = ref({
    objectId: null as number | null,
    arrivalDate: null as number | null,
    departureDate: null as number | null,
    status: 'pending' as 'pending' | 'active' | 'completed' | 'cancelled',
    isPaid: false
})

const rules: FormRules = {
    objectId: {
        required: true,
        message: 'Please select a rent object',
        trigger: 'blur'
    },
    arrivalDate: {
        required: true,
        message: 'Please select arrival date',
        trigger: 'blur'
    },
    departureDate: {
        required: true,
        message: 'Please select departure date',
        trigger: 'blur'
    },
    status: {
        required: true,
        message: 'Please select status',
        trigger: 'blur'
    }
}

const objectOptions = ref<{ label: string; value: number }[]>([])
const statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
]

const fetchObjects = async () => {
    try {
        const response = await api.get('/rentObject/all')
        objects.value = response.data.objects
        objectOptions.value = objects.value.map(obj => ({
            label: `${obj.name} ($${obj.costPerHour}/hour)`,
            value: obj.id
        }))
    } catch (error) {
        console.error('Error fetching objects:', error)
        message.error('Failed to fetch objects')
    }
}

const handleCreateBooking = async () => {
    try {
        await formRef.value?.validate()
        creating.value = true

        const response = await api.post('/booking/', {
            objectId: formValue.value.objectId,
            arrivalDate: new Date(formValue.value.arrivalDate!).toISOString(),
            departureDate: new Date(formValue.value.departureDate!).toISOString(),
            status: formValue.value.status,
            isPaid: formValue.value.isPaid
        })

        message.success('Booking created successfully')
        router.push('/bookings')
    } catch (error: any) {
        console.error('Error creating booking:', error)
        message.error('Failed to create booking: ' + (error.response?.data?.message || error.message || 'Unknown error'))
    } finally {
        creating.value = false
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}

onMounted(() => {
    fetchObjects()
})
</script>

<style scoped>
.n-card {
    height: 100%;
}
</style>