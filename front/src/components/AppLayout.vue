<template>
    <n-layout position="absolute">
        <n-layout-header bordered>
            <!-- Header content removed as requested -->
        </n-layout-header>
        <n-layout has-sider position="absolute">
            <n-layout-sider bordered :width="240">
                <Sidebar />
            </n-layout-sider>
            <n-layout-content>
                <router-view v-slot="{ Component }">
                    <component :is="Component" />
                </router-view>
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { NLayout, NLayoutHeader, NLayoutSider, NLayoutContent, NButton } from 'naive-ui'

const router = useRouter()

const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
}
</script>

<style scoped>
/* Optional: Add some padding to content if needed */
.n-layout-content {
    padding: 20px;
}
</style>