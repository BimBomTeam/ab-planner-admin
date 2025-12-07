import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_URL = '/api/v1'

export const useLessonsStore = defineStore('lessons', {
  state: () => ({
    lessons: [],
    loading: false,
    error: null,
    lessonStatuses: [
      { value: 'scheduled', label: 'Zaplanowane' },
      { value: 'rescheduled', label: 'Przełożone' },
      { value: 'cancelled', label: 'Odwołane' }
    ],
    lessonTypes: [
      { value: 'lecture', label: 'Wykład' },
      { value: 'lab', label: 'Laboratorium' },
      { value: 'seminar', label: 'Seminarium' },
      { value: 'project', label: 'Projekt' }
    ]
  }),

  getters: {
    getLessonById: (state) => (id) => {
      return state.lessons.find(lesson => lesson.id === id)
    },
    getLessonsToday: (state) => {
      const today = new Date().toISOString().split('T')[0]
      return state.lessons.filter(lesson => lesson.starts_at.startsWith(today))
    }
  },

  actions: {
    async fetchLessons(filters = {}) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const params = new URLSearchParams()
        if (filters.group_id) params.append('group_id', filters.group_id)
        if (filters.date_from) params.append('date_from', filters.date_from)
        if (filters.date_to) params.append('date_to', filters.date_to)

        const response = await axios.get(`${API_URL}/lessons`, {
          params,
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.lessons = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się pobrać listy zajęć'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLesson(lessonData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        // Ensure proper types for IDs
        const payload = {
            ...lessonData,
            subject_id: parseInt(lessonData.subject_id),
            lecturer_user_id: parseInt(lessonData.lecturer_user_id),
            room_id: parseInt(lessonData.room_id),
            group_id: parseInt(lessonData.group_id)
        }

        const response = await axios.post(`${API_URL}/lessons`, payload, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.lessons.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się dodać zajęć'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createLessonSeries(seriesData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
         // Ensure proper types for IDs in the nested lesson object
         const lessonPayload = {
            ...seriesData.lesson,
            subject_id: parseInt(seriesData.lesson.subject_id),
            lecturer_user_id: parseInt(seriesData.lesson.lecturer_user_id),
            room_id: parseInt(seriesData.lesson.room_id),
            group_id: parseInt(seriesData.lesson.group_id)
        }

        const payload = {
            lesson: lessonPayload,
            repeat_every_days: parseInt(seriesData.repeat_every_days),
            occurrences: parseInt(seriesData.occurrences)
        }

        const response = await axios.post(`${API_URL}/lessons/series`, payload, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        
        // Add all created lessons to state
        if (Array.isArray(response.data)) {
            this.lessons.push(...response.data)
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się dodać serii zajęć'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateLesson(id, lessonData) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        const response = await axios.patch(`${API_URL}/lessons/${id}`, lessonData, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        const index = this.lessons.findIndex(l => l.id === id)
        if (index !== -1) {
          this.lessons[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się zaktualizować zajęć'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLesson(id) {
      this.loading = true
      this.error = null
      const authStore = useAuthStore()
      
      try {
        await axios.delete(`${API_URL}/lessons/${id}`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        })
        this.lessons = this.lessons.filter(l => l.id !== id)
      } catch (error) {
        this.error = error.response?.data?.detail || 'Nie udało się usunąć zajęć'
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
