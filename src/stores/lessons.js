import { defineStore } from 'pinia'

export const useLessonsStore = defineStore('lessons', {
  state: () => ({
    lessons: [
      {
        id: 1,
        starts_at: '2025-11-18T08:00:00Z',
        ends_at: '2025-11-18T09:30:00Z',
        status: 'scheduled',
        lesson_type: 'lecture',
        subject: { id: 1, name: 'Programowanie obiektowe', code: 'PO' },
        room: { id: 1, number: '101', building: 'A', capacity: 50 },
        group: { id: 1, code: 'INF1A' },
        lecturer: { id: 2, name: 'Anna Nowak', email: 'anna.nowak@example.com' }
      },
      {
        id: 2,
        starts_at: '2025-11-18T10:00:00Z',
        ends_at: '2025-11-18T11:30:00Z',
        status: 'scheduled',
        lesson_type: 'lab',
        subject: { id: 2, name: 'Bazy danych', code: 'BD' },
        room: { id: 2, number: '205', building: 'B', capacity: 25 },
        group: { id: 2, code: 'INF1B' },
        lecturer: { id: 2, name: 'Anna Nowak', email: 'anna.nowak@example.com' }
      },
      {
        id: 3,
        starts_at: '2025-11-19T12:00:00Z',
        ends_at: '2025-11-19T13:30:00Z',
        status: 'rescheduled',
        lesson_type: 'lecture',
        subject: { id: 4, name: 'Analiza matematyczna', code: 'AM' },
        room: { id: 3, number: '301', building: 'C', capacity: 80 },
        group: { id: 3, code: 'MAT1A' },
        lecturer: { id: 2, name: 'Anna Nowak', email: 'anna.nowak@example.com' }
      }
    ],
    rooms: [
      { id: 1, number: '101', building: 'A', capacity: 50 },
      { id: 2, number: '205', building: 'B', capacity: 25 },
      { id: 3, number: '301', building: 'C', capacity: 80 },
      { id: 4, number: '102', building: 'A', capacity: 30 }
    ],
    lessonStatuses: [
      { value: 'scheduled', label: 'Zaplanowane' },
      { value: 'rescheduled', label: 'Przełożone' },
      { value: 'cancelled', label: 'Odwołane' }
    ]
  }),
  
  getters: {
    getLessonById: (state) => (id) => {
      return state.lessons.find(lesson => lesson.id === id)
    },
    getLessonsByGroup: (state) => (groupId) => {
      return state.lessons.filter(lesson => lesson.group.id === groupId)
    },
    getLessonsByStatus: (state) => (status) => {
      return state.lessons.filter(lesson => lesson.status === status)
    },
    getLessonsToday: (state) => {
      const today = new Date().toDateString()
      return state.lessons.filter(lesson => {
        const lessonDate = new Date(lesson.starts_at).toDateString()
        return lessonDate === today
      })
    }
  },
  
  actions: {
    addLesson(lesson) {
      const id = Math.max(...this.lessons.map(l => l.id)) + 1
      this.lessons.push({ ...lesson, id })
    },
    
    updateLesson(id, updates) {
      const index = this.lessons.findIndex(lesson => lesson.id === id)
      if (index !== -1) {
        this.lessons[index] = { ...this.lessons[index], ...updates }
      }
    },
    
    deleteLesson(id) {
      const index = this.lessons.findIndex(lesson => lesson.id === id)
      if (index !== -1) {
        this.lessons.splice(index, 1)
      }
    },
    
    addRoom(room) {
      const id = Math.max(...this.rooms.map(r => r.id)) + 1
      this.rooms.push({ ...room, id })
    }
  }
})