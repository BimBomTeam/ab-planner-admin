import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = '/api/v1'

// PKCE helpers
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let text = ''
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

async function sha256(plain) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

function base64urlencode(buffer) {
    const bytes = new Uint8Array(buffer)
    let str = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i])
    }
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

async function generateCodeChallenge(codeVerifier) {
    const hashed = await sha256(codeVerifier)
    return base64urlencode(hashed)
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        codeVerifier: null,
        codeChallenge: null
    }),

    getters: {
        currentUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        userRole: (state) => state.user?.role?.code || null
    },

    actions: {
        // Initialize PKCE flow
        async initPKCE() {
            this.codeVerifier = generateRandomString(128)
            this.codeChallenge = await generateCodeChallenge(this.codeVerifier)

            // Store code verifier in sessionStorage for callback
            sessionStorage.setItem('pkce_code_verifier', this.codeVerifier)

            return this.codeChallenge
        },

        // Get Microsoft login URL
        async getMicrosoftLoginUrl() {
            try {
                const codeChallenge = await this.initPKCE()
                const redirectUri = `${window.location.origin}/auth/callback`

                const response = await axios.get(`${API_BASE_URL}/auth/microsoft/login-url`, {
                    params: {
                        code_challenge: codeChallenge,
                        state: 'random_state_' + Date.now()
                    }
                })

                return response.data.authorization_url
            } catch (error) {
                console.error('Error getting Microsoft login URL:', error)
                throw new Error('Nie udało się uzyskać adresu URL logowania Microsoft')
            }
        },

        // Handle Microsoft callback
        async handleMicrosoftCallback(code) {
            try {
                const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
                if (!codeVerifier) {
                    throw new Error('Brak code verifier - sesja wygasła')
                }

                const redirectUri = `${window.location.origin}/auth/callback`

                const response = await axios.post(`${API_BASE_URL}/auth/microsoft/token`, {
                    code,
                    code_verifier: codeVerifier,
                    redirect_uri: redirectUri
                })

                const { access_token, refresh_token, user } = response.data

                this.accessToken = access_token
                this.refreshToken = refresh_token
                this.user = user
                this.isAuthenticated = true

                // Save to localStorage
                localStorage.setItem('access_token', access_token)
                localStorage.setItem('refresh_token', refresh_token)
                localStorage.setItem('user', JSON.stringify(user))

                // Clear PKCE data
                sessionStorage.removeItem('pkce_code_verifier')

                return { success: true, user }
            } catch (error) {
                console.error('Microsoft login error:', error)
                throw new Error(error.response?.data?.detail || 'Błąd podczas logowania przez Microsoft')
            }
        },

        // Refresh access token
        async refreshAccessToken() {
            try {
                if (!this.refreshToken) {
                    throw new Error('Brak refresh token')
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refresh_token: this.refreshToken
                })

                const { access_token, refresh_token } = response.data

                this.accessToken = access_token
                this.refreshToken = refresh_token

                localStorage.setItem('access_token', access_token)
                localStorage.setItem('refresh_token', refresh_token)

                return true
            } catch (error) {
                console.error('Token refresh error:', error)
                this.logout()
                return false
            }
        },

        // Logout
        async logout() {
            try {
                if (this.refreshToken) {
                    await axios.post(
                        `${API_BASE_URL}/auth/logout`,
                        { refresh_token: this.refreshToken },
                        {
                            headers: {
                                Authorization: `Bearer ${this.accessToken}`
                            }
                        }
                    )
                }
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                // Clear state
                this.user = null
                this.isAuthenticated = false
                this.accessToken = null
                this.refreshToken = null

                // Clear storage
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                localStorage.removeItem('user')
                sessionStorage.removeItem('pkce_code_verifier')
            }
        },

        // Check if user is logged in (from localStorage)
        checkAuth() {
            const accessToken = localStorage.getItem('access_token')
            const refreshToken = localStorage.getItem('refresh_token')
            const user = localStorage.getItem('user')

            if (accessToken && refreshToken && user) {
                this.accessToken = accessToken
                this.refreshToken = refreshToken
                this.user = JSON.parse(user)
                this.isAuthenticated = true
                return true
            }

            return false
        },

        // Get current user from API
        async getCurrentUser() {
            try {
                const response = await axios.get(`${API_BASE_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                })

                this.user = response.data
                localStorage.setItem('user', JSON.stringify(response.data))

                return response.data
            } catch (error) {
                console.error('Get current user error:', error)
                if (error.response?.status === 401) {
                    // Try to refresh token
                    const refreshed = await this.refreshAccessToken()
                    if (refreshed) {
                        return this.getCurrentUser()
                    }
                }
                throw error
            }
        }
    }
})

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            const authStore = useAuthStore()
            const refreshed = await authStore.refreshAccessToken()

            if (refreshed) {
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
                return axios(originalRequest)
            }
        }

        return Promise.reject(error)
    }
)
