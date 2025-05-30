<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, type GlobalThemeOverrides, darkTheme } from 'naive-ui'
import { ref } from 'vue'

// Use Naive UI's built-in dark theme
const theme = ref(darkTheme)

</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <div>
        <RouterView />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>
