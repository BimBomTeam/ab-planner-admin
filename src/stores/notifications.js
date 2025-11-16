import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [
      {
        id: 1,
        user_id: 3,
        payload: {
          title: 'Nowe zajęcia',
          message: 'Dodano nowe zajęcia z Programowania obiektowego',
          type: 'lesson_added'
        },
        status: 'sent',
        attempts: 1,
        created_at: '2025-11-16T08:00:00Z',
        sent_at: '2025-11-16T08:01:00Z'
      },
      {
        id: 2,
        user_id: 4,
        payload: {
          title: 'Zmiana terminu',
          message: 'Zajęcia z Analizy matematycznej zostały przełożone',
          type: 'lesson_rescheduled'
        },
        status: 'pending',
        attempts: 0,
        created_at: '2025-11-16T09:30:00Z',
        sent_at: null
      },
      {
        id: 3,
        user_id: 3,
        payload: {
          title: 'Przypomnienie',
          message: 'Za godzinę rozpoczną się zajęcia laboratoryjne',
          type: 'lesson_reminder'
        },
        status: 'failed',
        attempts: 3,
        created_at: '2025-11-16T09:00:00Z',
        sent_at: null
      }
    ],
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
    addNotification(notification) {
      const id = Math.max(...this.notifications.map(n => n.id)) + 1
      this.notifications.push({
        ...notification,
        id,
        status: 'pending',
        attempts: 0,
        created_at: new Date().toISOString(),
        sent_at: null
      })
    },
    
    updateNotification(id, updates) {
      const index = this.notifications.findIndex(notification => notification.id === id)
      if (index !== -1) {
        this.notifications[index] = { ...this.notifications[index], ...updates }
      }
    },
    
    markAsSent(id) {
      this.updateNotification(id, {
        status: 'sent',
        sent_at: new Date().toISOString()
      })
    },
    
    markAsFailed(id) {
      const notification = this.getNotificationById(id)
      if (notification) {
        this.updateNotification(id, {
          status: 'failed',
          attempts: notification.attempts + 1
        })
      }
    },
    
    deleteNotification(id) {
      const index = this.notifications.findIndex(notification => notification.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    }
  }
})