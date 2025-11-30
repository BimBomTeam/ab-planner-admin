<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 auth-card">
          <!-- Header -->
          <v-card-title class="text-center bg-primary text-white pa-6">
            <div class="w-100">
              <v-icon size="48" class="mb-2">mdi-lock-reset</v-icon>
              <h2 class="text-h5 font-weight-bold">Resetowanie hasła</h2>
              <p class="text-subtitle-2 mt-2 mb-0">Podaj swój email, aby zresetować hasło</p>
            </div>
          </v-card-title>

          <v-card-text class="pa-8">
            <!-- Success state -->
            <div v-if="success" class="text-center">
              <v-icon size="80" color="success" class="mb-4">mdi-check-circle</v-icon>
              <h3 class="text-h6 mb-3">Email został wysłany!</h3>
              <p class="text-body-2 mb-6">
                Sprawdź swoją skrzynkę pocztową. Wysłaliśmy link do resetowania hasła na adres:
              </p>
              <v-chip color="primary" variant="tonal" class="mb-6">
                {{ email }}
              </v-chip>
              <p class="text-caption text-grey mb-6">
                Jeśli nie otrzymasz wiadomości w ciągu kilku minut, sprawdź folder spam.
              </p>
              <v-btn
                color="primary"
                variant="outlined"
                block
                to="/login"
              >
                Powrót do logowania
              </v-btn>
            </div>

            <!-- Form state -->
            <div v-else>
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

              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Wprowadź adres email powiązany z Twoim kontem. Wyślemy Ci link do resetowania hasła.
              </v-alert>

              <!-- Reset Password Form -->
              <v-form ref="form" v-model="valid" @submit.prevent="handleResetPassword">
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  variant="outlined"
                  class="mb-4"
                  required
                  :disabled="loading"
                  autofocus
                ></v-text-field>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!valid || loading"
                  class="mb-4"
                >
                  Wyślij link resetujący
                </v-btn>

                <v-divider class="my-4"></v-divider>

                <div class="text-center">
                  <v-btn
                    variant="text"
                    color="primary"
                    to="/login"
                    :disabled="loading"
                    prepend-icon="mdi-arrow-left"
                  >
                    Powrót do logowania
                  </v-btn>
                </div>
              </v-form>
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
  name: 'ResetPassword',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      valid: false,
      loading: false,
      success: false,
      email: '',
      error: null,
      emailRules: [
        v => !!v || 'Email jest wymagany',
        v => /.+@.+\..+/.test(v) || 'Email musi być poprawny'
      ]
    }
  },
  methods: {
    async handleResetPassword() {
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) return

      this.loading = true
      this.error = null

      try {
        await this.authStore.resetPassword(this.email)
        this.success = true
      } catch (err) {
        this.error = err.message || 'Wystąpił błąd podczas resetowania hasła'
      } finally {
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
}

.w-100 {
  width: 100%;
}
</style>
