<template>
    <div class="h-full flex flex-col">
        <!-- Navigation -->
        <nav class="flex-1 p-4">
            <n-menu :options="menuOptions" :value="activeKey" @update:value="handleMenuUpdate" />
        </nav>

    </div>
</template>

<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NMenu, NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import {
    GridOutline as DashboardIcon,
    CartOutline as OrdersIcon,
    CalendarOutline as BookingsIcon,
    PeopleOutline as ClientsIcon,
    BusinessOutline as ObjectsIcon,
    ConstructOutline as ServicesIcon,
    BagOutline as ProductsIcon,
    PersonOutline as UsersIcon,
    BasketOutline as BasketIcon
} from '@vicons/ionicons5'

// Icons
function renderIcon(icon: any) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

// Menu Options
const menuOptions: MenuOption[] = [
    {
        label: 'KorRent CRM',
        key: 'KorRent CRM',
        icon: renderIcon(BasketIcon)
    },
    {
        label: 'Бронирования',
        key: 'bookings',
        icon: renderIcon(BookingsIcon)
    },
    {
        label: 'Клиенты',
        key: 'clients',
        icon: renderIcon(ClientsIcon)
    },
    {
        label: 'Объекты',
        key: 'objects',
        icon: renderIcon(ObjectsIcon)
    },
    {
        label: 'Услуги',
        key: 'services',
        icon: renderIcon(ServicesIcon)
    },
    {
        label: 'Товары',
        key: 'products',
        icon: renderIcon(ProductsIcon)
    },
    {
        label: 'Пользователи',
        key: 'users',
        icon: renderIcon(UsersIcon)
    }
]

const router = useRouter()
const route = useRoute()
const activeKey = ref(route.name as string)

// Watch for route changes and update activeKey
watch(() => route.name, (newRouteName) => {
    if (typeof newRouteName === 'string') {
        activeKey.value = newRouteName
    }
})

const handleMenuUpdate = (key: string) => {
    activeKey.value = key // Keep this as it updates the key immediately on click
    router.push(`/${key}`)
}
</script>

<style scoped>
.n-menu {
    height: 100%;
}

:deep(.n-menu-item) {
    margin: 4px 0;
}

:deep(.n-menu-item-content) {
    padding: 12px 16px;
}

:deep(.n-menu-item-content__icon) {
    margin-right: 12px;
}
</style>