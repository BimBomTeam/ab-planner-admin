import { defineStore } from 'pinia'

export const useGroupsStore = defineStore('groups', {
  state: () => ({
    groups: [
      {
        id: 1,
        code: 'INF1A',
        program: { id: 1, name: 'Informatyka' },
        year: { id: 1, program_id: 1, year: 1 },
        specialization: { id: 1, program_id: 1, name: 'Inżynieria oprogramowania' },
        group_type: { code: 'lecture', label: 'Wykład' }
      },
      {
        id: 2,
        code: 'INF1B',
        program: { id: 1, name: 'Informatyka' },
        year: { id: 1, program_id: 1, year: 1 },
        specialization: { id: 1, program_id: 1, name: 'Inżynieria oprogramowania' },
        group_type: { code: 'lab', label: 'Laboratorium' }
      },
      {
        id: 3,
        code: 'MAT1A',
        program: { id: 2, name: 'Matematyka' },
        year: { id: 4, program_id: 2, year: 1 },
        specialization: { id: 3, program_id: 2, name: 'Matematyka stosowana' },
        group_type: { code: 'lecture', label: 'Wykład' }
      }
    ],
    groupTypes: [
      { code: 'lecture', label: 'Wykład' },
      { code: 'lab', label: 'Laboratorium' },
      { code: 'seminar', label: 'Seminarium' },
      { code: 'project', label: 'Projekt' }
    ]
  }),
  
  getters: {
    getGroupById: (state) => (id) => {
      return state.groups.find(group => group.id === id)
    },
    getGroupsByProgram: (state) => (programId) => {
      return state.groups.filter(group => group.program.id === programId)
    },
    getGroupsByType: (state) => (groupType) => {
      return state.groups.filter(group => group.group_type.code === groupType)
    }
  },
  
  actions: {
    addGroup(group) {
      const id = Math.max(...this.groups.map(g => g.id)) + 1
      this.groups.push({ ...group, id })
    },
    
    updateGroup(id, updates) {
      const index = this.groups.findIndex(group => group.id === id)
      if (index !== -1) {
        this.groups[index] = { ...this.groups[index], ...updates }
      }
    },
    
    deleteGroup(id) {
      const index = this.groups.findIndex(group => group.id === id)
      if (index !== -1) {
        this.groups.splice(index, 1)
      }
    }
  }
})