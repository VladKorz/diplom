import './assets/main.css'
import './index.css'

import { createApp } from 'vue'
import { create, NConfigProvider, NMessageProvider } from 'naive-ui'
import App from './App.vue'
import router from './router'

const naive = create({
  components: [NConfigProvider, NMessageProvider]
})

const app = createApp(App)

app.use(router)
app.use(naive)

app.mount('#app')
