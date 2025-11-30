<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="10" md="6" lg="5" xl="4" class="pa-4">
        <v-card class="elevation-12 auth-card">
          <!-- Header -->
          <v-card-title class="text-center bg-primary text-white pa-6 pa-sm-8">
            <div class="w-100">
              <v-icon size="48" class="mb-3">mdi-school</v-icon>
              <h2 class="text-h5 text-sm-h4 font-weight-bold">AB Planner Admin</h2>
              <p class="text-subtitle-2 text-sm-subtitle-1 mt-2 mb-0">
                Zaloguj się do panelu administracyjnego
              </p>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pa-sm-8 pa-md-10">
            <!-- Alert messages -->
            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="error = null"
            >
              {{ error }}
            </v-alert>

            <!-- Microsoft Login Button -->
            <div class="text-center">
              <v-btn
                color="primary"
                size="x-large"
                block
                :loading="loading"
                @click="handleMicrosoftLogin"
                prepend-icon="mdi-microsoft"
                class="mb-4 text-none"
                style="min-height: 56px;"
              >
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.auth-card {
  border-radius: 16px !important;
  overflow: hidden;
  max-width: 100%;
}

.w-100 {
  width: 100%;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .auth-card {
    border-radius: 12px !important;
  }
}

/* Tablet and up */
@media (min-width: 600px) {
  .auth-card {
    min-width: 450px;
  }
}

/* Desktop */
@media (min-width: 960px) {
  .auth-card {
    min-width: 500px;
  }
}
</style>
