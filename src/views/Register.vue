<template>
  <v-container fluid class="fill-height auth-container pa-0">
    <v-row align="center" justify="center" class="fill-height ma-0">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12 auth-card">
          <!-- Header -->
          <v-card-title class="text-center bg-primary text-white pa-6">
            <div class="w-100">
              <v-icon size="48" class="mb-2">mdi-account-plus</v-icon>
              <h2 class="text-h5 font-weight-bold">Rejestracja</h2>
              <p class="text-subtitle-2 mt-2 mb-0">Utwórz nowe konto w AB Planner</p>
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

            <!-- Registration Form -->
            <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">
              <v-text-field
                v-model="name"
                :rules="nameRules"
                label="Imię i nazwisko"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                class="mb-3"
                required
                :disabled="loading"
              ></v-text-field>

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
                class="mb-3"
                required
                :disabled="loading"
                hint="Minimum 6 znaków"
                persistent-hint
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                :rules="confirmPasswordRules"
                label="Potwierdź hasło"
                prepend-inner-icon="mdi-lock-check"
                :type="showConfirmPassword ? 'text' : 'password'"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                class="mb-3"
                required
                :disabled="loading"
              ></v-text-field>

              <v-checkbox
                v-model="acceptTerms"
                :rules="termsRules"
                :disabled="loading"
                class="mb-2"
              >
                <template v-slot:label>
                  <div class="text-body-2">
                    Akceptuję 
                    <a href="#" @click.prevent class="text-primary">regulamin</a>
                    i 
                    <a href="#" @click.prevent class="text-primary">politykę prywatności</a>
                  </div>
                </template>
              </v-checkbox>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!valid || loading"
                class="mb-4 mt-2"
              >
                Zarejestruj się
              </v-btn>

              <v-divider class="my-4"></v-divider>

              <div class="text-center">
                <p class="text-body-2 mb-2">Masz już konto?</p>
                <v-btn
                  variant="text"
                  color="primary"
                  to="/login"
                  :disabled="loading"
                >
                  Zaloguj się
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
  name: 'Register',
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      valid: false,
      loading: false,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      acceptTerms: false,
      error: null,
      nameRules: [
        v => !!v || 'Imię i nazwisko jest wymagane',
        v => v.length >= 3 || 'Imię i nazwisko musi mieć co najmniej 3 znaki'
      ],
      emailRules: [
        v => !!v || 'Email jest wymagany',
        v => /.+@.+\..+/.test(v) || 'Email musi być poprawny'
      ],
      passwordRules: [
        v => !!v || 'Hasło jest wymagane',
        v => v.length >= 6 || 'Hasło musi mieć co najmniej 6 znaków'
      ],
      termsRules: [
        v => !!v || 'Musisz zaakceptować regulamin'
      ]
    }
  },
  computed: {
    confirmPasswordRules() {
      return [
        v => !!v || 'Potwierdzenie hasła jest wymagane',
        v => v === this.password || 'Hasła muszą być identyczne'
      ]
    }
  },
  methods: {
    async handleRegister() {
      const { valid } = await this.$refs.form.validate()
      
      if (!valid) return

      this.loading = true
      this.error = null

      try {
        await this.authStore.register({
          name: this.name,
          email: this.email,
          password: this.password
        })
        
        // Redirect to dashboard after successful registration
        this.$router.push('/dashboard')
      } catch (err) {
        this.error = err.message || 'Wystąpił błąd podczas rejestracji'
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
