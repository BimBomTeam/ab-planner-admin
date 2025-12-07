import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useSubjectsStore = defineStore('subjects', {
  state: () => ({
    subjects: [],
    loading: false,
    error: null
  }),

  getters: {
    getSubjectById: (state) => (id) => {
      return state.subjects.find(subject => subject.id === id)
    }
  },

  actions: {
    async fetchSubjects() {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.get(`${API_URL}/subjects`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.subjects = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać listy przedmiotów'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createSubject(subjectData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.post(`${API_URL}/subjects`, subjectData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.subjects.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się dodać przedmiotu'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateSubject(id, subjectData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.patch(`${API_URL}/subjects/${id}`, subjectData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        const index = this.subjects.findIndex(s => s.id === id)
        if (index !== -1) {
          this.subjects[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się zaktualizować przedmiotu'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSubject(id) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        await axios.delete(`${API_URL}/subjects/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.subjects = this.subjects.filter(s => s.id !== id)
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się usunąć przedmiotu'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
