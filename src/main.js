import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { pl } from 'vuetify/locale'
import { setupAxios } from './plugins/axios'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'pl',
    fallback: 'en',
    messages: { pl },
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1565C0',
          secondary: '#424242',
          accent: '#1976D2',
          error: '#D32F2F',
          info: '#0288D1',
          success: '#388E3C',
          warning: '#F57C00',
          background: '#FAFAFA',
          surface: '#FFFFFF'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#64B5F6', // Blue 300
          secondary: '#78909C', // Blue Grey 400
          accent: '#448AFF', // Blue Accent 200
          error: '#E57373', // Red 300
          info: '#4FC3F7', // Light Blue 300
          success: '#81C784', // Green 300
          warning: '#FFB74D', // Orange 300
          background: '#121212',
          surface: '#1E1E1E'
        }
      }
    }
  }
})

const pinia = createPinia()

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .mount('#app')

// Setup Axios interceptors after app is mounted and pinia is ready
setupAxios()
