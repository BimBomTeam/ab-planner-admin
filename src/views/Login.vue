<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="10" md="6" lg="5" xl="4" class="pa-4">
        <v-card class="elevation-0 auth-card" variant="flat">
          <!-- Header -->
          <v-card-title class="text-center pa-6 pa-sm-8 header-bg">
            <div class="w-100">
              <v-avatar color="white" variant="outlined" size="80" class="mb-4">
                <v-icon size="40" color="white">mdi-school</v-icon>
              </v-avatar>
              <h2 class="text-h5 text-sm-h4 font-weight-bold text-white">AB Planner Admin</h2>
              <p class="text-subtitle-2 text-sm-subtitle-1 mt-2 mb-0 text-grey-lighten-1">
                Zaloguj się do panelu administracyjnego
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pa-sm-8 pa-md-10">
            <!-- Alert messages -->
            <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = null">
              {{ error }}
            </v-alert>

            <!-- Microsoft Login Button -->
            <div class="text-center">
              <v-btn color="white" size="x-large" block :loading="loading" @click="handleMicrosoftLogin"
                prepend-icon="mdi-microsoft" class="mb-4 text-none" style="min-height: 56px;">
                <span class="text-body-1 text-sm-h6">Zaloguj się przez Microsoft</span>
              </v-btn>

              <p class="text-caption text-sm-body-2 text-grey mt-4 px-2">
                Użyj swojego konta Microsoft do zalogowania się do systemu AB Planner
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Login',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      loading: false,
      error: null
    }
  },
  methods: {
    async handleMicrosoftLogin() {
      this.loading = true
      this.error = null

      try {
        const loginUrl = await this.authStore.getMicrosoftLoginUrl()

        // Redirect to Microsoft login
        window.location.href = loginUrl
      } catch (err) {
        this.error = err.message || 'Wystąpił błąd podczas logowania'
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-container {
  background: radial-gradient(circle at center, #1e1e1e 0%, #121212 100%);
  background-color: #121212;
  /* Fallback */
  min-height: 100vh;
}

.auth-card {
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgb(30, 30, 30) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  overflow: hidden;
  max-width: 100%;
}

.w-100 {
  width: 100%;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .auth-card {
    border-radius: 20px !important;
  }
}

/* Tablet and up */
@media (min-width: 600px) {
  .auth-card {
    min-width: 450px;
  }
}

.header-bg {
  background: linear-gradient(to bottom, #2c3e50, #1a252f);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Desktop */
@media (min-width: 960px) {
  .auth-card {
    min-width: 480px;
  }
}
</style>
