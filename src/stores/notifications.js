import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    loading: false,
    error: null,
    notificationStatuses: [
      { value: 'pending', label: 'Oczekujące' },
      { value: 'sent', label: 'Wysłane' },
      { value: 'failed', label: 'Nieudane' }
    ]
  }),
  
  getters: {
    getNotificationById: (state) => (id) => {
      return state.notifications.find(notification => notification.id === id)
    },
    getNotificationsByUser: (state) => (userId) => {
      return state.notifications.filter(notification => notification.user_id === userId)
    },
    getNotificationsByStatus: (state) => (status) => {
      return state.notifications.filter(notification => notification.status === status)
    },
    getPendingNotifications: (state) => {
      return state.notifications.filter(notification => notification.status === 'pending')
    }
  },
  
  actions: {
    async fetchNotifications() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.get(`${API_URL}/notifications`)
        this.notifications = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać powiadomień'
        // Don't throw here to avoid crashing dashboard if notifications fail
        console.error('Fetch notifications error:', error)
        return []
      } finally {
        this.loading = false
      }
    },
    
    // Admin action: Create notification manually
    async createNotification(notificationData) {
        this.loading = true
        this.error = null
        const authStore = useAuthStore()

        try {
            const response = await axios.post(`${API_URL}/notifications`, notificationData)
            this.notifications.push(response.data)
            return response.data
        } catch (error) {
            this.error = error.response?.data?.detail || 'Nie udało się utworzyć powiadomienia'
            throw error
        } finally {
            this.loading = false
        }
    },

    async deleteNotification(id) {
        this.loading = true
        this.error = null
        const authStore = useAuthStore()

        try {
            await axios.delete(`${API_URL}/notifications/${id}`)
            this.notifications = this.notifications.filter(n => n.id !== id)
        } catch (error) {
            this.error = error.response?.data?.detail || 'Nie udało się usunąć powiadomienia'
            throw error
        } finally {
            this.loading = false
        }
    }
  }
})
