import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAuthenticated: false,
        token: null,
        // Mock users database
        mockUsers: [
            {
                id: 1,
                email: 'admin@abplanner.pl',
                password: 'admin123',
                name: 'Admin',
                role: 'admin'
            },
            {
                id: 2,
                email: 'user@abplanner.pl',
                password: 'user123',
                name: 'Jan Kowalski',
                role: 'user'
            }
        ]
    }),

    getters: {
        currentUser: (state) => state.user,
        isLoggedIn: (state) => state.isAuthenticated,
        userRole: (state) => state.user?.role || null
    },

    actions: {
        // Mock login
        async login(email, password) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const user = this.mockUsers.find(
                        u => u.email === email && u.password === password
                    )

                    if (user) {
                        this.user = {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role
                        }
                        this.isAuthenticated = true
                        this.token = 'mock-jwt-token-' + Date.now()

                        // Save to localStorage
                        localStorage.setItem('auth_token', this.token)
                        localStorage.setItem('auth_user', JSON.stringify(this.user))

                        resolve({ success: true, user: this.user })
                    } else {
                        reject({ success: false, message: 'Nieprawidłowy email lub hasło' })
                    }
                }, 800) // Simulate API delay
            })
        },

        // Mock register
        async register(userData) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Check if email already exists
                    const existingUser = this.mockUsers.find(u => u.email === userData.email)

                    if (existingUser) {
                        reject({ success: false, message: 'Użytkownik z tym adresem email już istnieje' })
                        return
                    }

                    // Create new user
                    const newUser = {
                        id: this.mockUsers.length + 1,
                        email: userData.email,
                        password: userData.password,
                        name: userData.name,
                        role: 'user'
                    }

                    this.mockUsers.push(newUser)

                    // Auto login after registration
                    this.user = {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role
                    }
                    this.isAuthenticated = true
                    this.token = 'mock-jwt-token-' + Date.now()

                    // Save to localStorage
                    localStorage.setItem('auth_token', this.token)
                    localStorage.setItem('auth_user', JSON.stringify(this.user))

                    resolve({ success: true, user: this.user })
                }, 800)
            })
        },

        // Mock reset password
        async resetPassword(email) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const user = this.mockUsers.find(u => u.email === email)

                    if (user) {
                        // In real app, this would send an email
                        resolve({
                            success: true,
                            message: 'Link do resetowania hasła został wysłany na podany adres email'
                        })
                    } else {
                        reject({
                            success: false,
                            message: 'Nie znaleziono użytkownika z podanym adresem email'
                        })
                    }
                }, 800)
            })
        },

        // Logout
        logout() {
            this.user = null
            this.isAuthenticated = false
            this.token = null

            // Clear localStorage
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
        },

        // Check if user is logged in (from localStorage)
        checkAuth() {
            const token = localStorage.getItem('auth_token')
            const user = localStorage.getItem('auth_user')

            if (token && user) {
                this.token = token
                this.user = JSON.parse(user)
                this.isAuthenticated = true
                return true
            }

            return false
        }
    }
})
