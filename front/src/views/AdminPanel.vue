<template>
    <div class="flex flex-col h-full">
        <!-- Header -->
        <div class="bg-white shadow-sm p-4">
            <n-flex justify="space-between" align="center">
                <h1 class="text-xl font-semibold">Панель управления</h1>
                <n-flex align="center" gap="16">
                    <n-button type="error" @click="handleLogout">
                        Выйти
                    </n-button>
                </n-flex>
            </n-flex>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-4 overflow-auto">
            <n-card>
                <n-grid :cols="2" :x-gap="16" :y-gap="16">
                    <n-grid-item>
                        <n-card title="Статистика пользователей" hoverable @click="router.push('/users')">
                            <n-statistic label="Всего пользователей" :value="totalUsers">
                                <template #suffix>
                                    <n-button text type="primary" @click.stop="router.push('/users')">
                                        Смотреть всех
                                    </n-button>
                                </template>
                            </n-statistic>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card title="Обзор бронирований" hoverable @click="router.push('/bookings')">
                            <n-space vertical>
                                <n-statistic label="Всего бронирований" :value="totalBookings" />
                                <n-statistic label="Активные бронирования" :value="activeBookings">
                                    <template #suffix>
                                        <n-button text type="primary" @click.stop="router.push('/bookings')">
                                            Смотреть все
                                        </n-button>
                                    </template>
                                </n-statistic>
                            </n-space>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card title="Обзор объектов" hoverable @click="router.push('/objects')">
                            <n-statistic label="Всего объектов" :value="totalObjects">
                                <template #suffix>
                                    <n-button text type="primary" @click.stop="router.push('/objects')">
                                        Смотреть все
                                    </n-button>
                                </template>
                            </n-statistic>
                        </n-card>
                    </n-grid-item>
                    <n-grid-item>
                        <n-card title="Обзор клиентов" hoverable @click="router.push('/clients')">
                            <n-statistic label="Всего клиентов" :value="totalClients">
                                <template #suffix>
                                    <n-button text type="primary" @click.stop="router.push('/clients')">
                                        Смотреть всех
                                    </n-button>
                                </template>
                            </n-statistic>
                        </n-card>
                    </n-grid-item>
                </n-grid>
            </n-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NButton, NFlex, NGrid, NGridItem, NStatistic, NSpace, useMessage } from 'naive-ui'
import api from '../api/axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()

const totalUsers = ref(0)
const activeBookings = ref(0)
const totalBookings = ref(0)
const totalObjects = ref(0)
const totalClients = ref(0)
const userName = ref('')

const getUserNameFromToken = () => {
    const token = localStorage.getItem('token')
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            userName.value = payload.name
        } catch (error) {
            console.error('Error parsing token:', error)
            message.error('Не удалось получить информацию о пользователе')
        }
    }
}

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}


const fetchStats = async () => {
    try {
        // Fetch users count
        const usersResponse = await api.get('/user/all')
        totalUsers.value = usersResponse.data.users.length

        // Fetch objects count
        const objectsResponse = await api.get('/rentObject/all')
        totalObjects.value = objectsResponse.data.objects.length

        // Fetch bookings count
        const bookingsResponse = await api.get('/booking/all')
        const bookings = bookingsResponse.data.bookings
        totalBookings.value = bookings.length
        activeBookings.value = bookings.filter(
            (booking: any) => booking.status === 'active'
        ).length

        // Fetch clients count
        const clientsResponse = await api.get('/client/all')
        totalClients.value = clientsResponse.data.client.length
    } catch (error: any) {
        console.error('Error fetching stats:', error)
        message.error('Не удалось загрузить статистику панели управления')
    }
}

onMounted(() => {
    fetchStats()
    getUserNameFromToken()
})
</script>

<style scoped>
.n-card {
    height: 100%;
}

.n-grid {
    margin-top: 16px;
}
</style>