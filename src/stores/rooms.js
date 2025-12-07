import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [],
    loading: false,
    error: null
  }),

  getters: {
    getRoomById: (state) => (id) => {
      return state.rooms.find(room => room.id === id)
    }
  },

  actions: {
    async fetchRooms() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.get(`${API_URL}/rooms`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.rooms = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać listy sal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRoom(roomData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.post(`${API_URL}/rooms`, roomData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.rooms.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się dodać sali'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateRoom(id, roomData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.patch(`${API_URL}/rooms/${id}`, roomData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        const index = this.rooms.findIndex(r => r.id === id)
        if (index !== -1) {
          this.rooms[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się zaktualizować danych sali'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRoom(id) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        await axios.delete(`${API_URL}/rooms/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.rooms = this.rooms.filter(r => r.id !== id)
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się usunąć sali'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
