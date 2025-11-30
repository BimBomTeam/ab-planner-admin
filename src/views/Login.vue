<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 auth-card">
          <!-- Header -->
          <v-card-title class="text-center bg-primary text-white pa-6">
            <div class="w-100">
              <v-icon size="48" class="mb-2">mdi-school</v-icon>
              <h2 class="text-h5 font-weight-bold">AB Planner Admin</h2>
              <p class="text-subtitle-2 mt-2 mb-0">Zaloguj się do panelu administracyjnego</p>
            </div>
          </v-card-title>

          <v-card-text class="pa-8">
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
              v-if="successMessage"
              type="success"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="successMessage = null"
            >
              {{ successMessage }}
            </v-alert>

            <!-- Login Form -->
            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="Email"
                prepend-inner-icon="mdi-email"
                type="email"
                variant="outlined"
                class="mb-3"
                required
                :disabled="loading"
              ></v-text-field>

              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Hasło"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                class="mb-2"
                required
                :disabled="loading"
              ></v-text-field>

              <div class="d-flex justify-space-between align-center mb-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="Zapamiętaj mnie"
                  density="compact"
                  hide-details
                  :disabled="loading"
                ></v-checkbox>

                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  to="/reset-password"
                  :disabled="loading"
                >
                  Zapomniałeś hasła?
                </v-btn>
              </div>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!valid || loading"
                class="mb-4"
              >
                Zaloguj się
              </v-btn>

              <div class="text-center">
                <p class="text-body-2 mb-4">Nie masz konta?</p>
                <v-btn
                  variant="outlined"
                  color="primary"
                  size="large"  
                  block
                  to="/register"
                  :disabled="loading"
                >
                  Zarejestruj się
                </v-btn>
              </div>
            </v-form>
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
      valid: false,
      loading: false,
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      error: null,
      successMessage: null,
      emailRules: [
        v => !!v || 'Email jest wymagany',
        v => /.+@.+\..+/.test(v) || 'Email musi być poprawny'
      ],
      passwordRules: [
        v => !!v || 'Hasło jest wymagane',
        v => v.length >= 6 || 'Hasło musi mieć co najmniej 6 znaków'
      ]
    }
  },
  mounted() {
    // Check for success message from registration
    if (this.$route.query.registered) {
      this.successMessage = 'Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.'
    }
    if (this.$route.query.reset) {
      this.successMessage = 'Link do resetowania hasła został wysłany na Twój email.'
    }
  },
  methods: {
    async handleLogin() {
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) return

      this.loading = true
      this.error = null

      try {
        await this.authStore.login(this.email, this.password)
        
        // Redirect to dashboard
        this.$router.push('/dashboard')
      } catch (err) {
        this.error = err.message || 'Wystąpił błąd podczas logowania'
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
