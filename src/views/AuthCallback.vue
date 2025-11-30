<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 auth-card">
          <v-card-text class="pa-8 text-center">
            <v-progress-circular v-if="!error" indeterminate color="primary" size="64"
              class="mb-4"></v-progress-circular>

            <v-icon v-else size="64" color="error" class="mb-4">
              mdi-alert-circle
            </v-icon>

            <h3 class="text-h6 mb-2">
              {{ error ? 'Błąd logowania' : 'Logowanie...' }}
            </h3>

            <p class="text-body-2 text-grey">
              {{ error || 'Trwa weryfikacja danych logowania przez Microsoft' }}
            </p>

            <v-btn v-if="error" color="primary" size="large" variant="outlined" class="mt-4" to="/login">
              Powrót do logowania
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AuthCallback',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      error: null
    }
  },
  async mounted() {
    await this.handleCallback()
  },
  beforeRouteLeave(to, from, next) {
    // If there's an error and user is trying to leave, only allow if going to login
    if (this.error && to.path !== '/login') {
      next(false)
    } else {
      next()
    }
  },
  methods: {
    async handleCallback() {
      try {
        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          this.error = errorDescription || 'Logowanie zostało anulowane lub wystąpił błąd'
          return
        }

        if (!code) {
          this.error = 'Brak kodu autoryzacyjnego w odpowiedzi'
          return
        }

        // Exchange code for tokens
        const result = await this.authStore.handleMicrosoftCallback(code)

        // Check if user is student - reject login
        if (result.user?.role?.code === 'student') {
          await this.authStore.logout()
          this.error = 'Dostęp do panelu administracyjnego nie jest dostępny dla studentów'
          return
        }

        // Redirect to dashboard
        this.$router.push('/dashboard')
      } catch (err) {
        console.error('Callback error:', err)
        this.error = err.message || 'Wystąpił błąd podczas przetwarzania logowania'
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.auth-card {
  border-radius: 16px !important;
  overflow: hidden;
}
</style>
