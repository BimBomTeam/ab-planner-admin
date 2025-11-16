import { defineStore } from 'pinia'

export const useProgramsStore = defineStore('programs', {
  state: () => ({
    programs: [
      {
        id: 1,
        name: 'Informatyka',
        years: [
          { id: 1, program_id: 1, year: 1 },
          { id: 2, program_id: 1, year: 2 },
          { id: 3, program_id: 1, year: 3 }
        ],
        specializations: [
          { id: 1, program_id: 1, name: 'Inżynieria oprogramowania' },
          { id: 2, program_id: 1, name: 'Sztuczna inteligencja' }
        ]
      },
      {
        id: 2,
        name: 'Matematyka',
        years: [
          { id: 4, program_id: 2, year: 1 },
          { id: 5, program_id: 2, year: 2 },
          { id: 6, program_id: 2, year: 3 }
        ],
        specializations: [
          { id: 3, program_id: 2, name: 'Matematyka stosowana' },
          { id: 4, program_id: 2, name: 'Statystyka' }
        ]
      },
      {
        id: 3,
        name: 'Fizyka',
        years: [
          { id: 7, program_id: 3, year: 1 },
          { id: 8, program_id: 3, year: 2 }
        ],
        specializations: [
          { id: 5, program_id: 3, name: 'Fizyka teoretyczna' },
          { id: 6, program_id: 3, name: 'Fizyka doświadczalna' }
        ]
      }
    ],
    subjects: [
      { id: 1, name: 'Programowanie obiektowe', code: 'PO' },
      { id: 2, name: 'Bazy danych', code: 'BD' },
      { id: 3, name: 'Algorytmy i struktury danych', code: 'ASD' },
      { id: 4, name: 'Analiza matematyczna', code: 'AM' },
      { id: 5, name: 'Algebra liniowa', code: 'AL' },
      { id: 6, name: 'Mechanika klasyczna', code: 'MK' },
      { id: 7, name: 'Elektrodynamika', code: 'ED' },
      { id: 8, name: 'Statystyka matematyczna', code: 'SM' }
    ]
  }),
  
  getters: {
    allPrograms: (state) => state.programs,
    allSubjects: (state) => state.subjects,
    
    getProgramById: (state) => (id) => {
      return state.programs.find(program => program.id === id)
    },
    
    getProgramBrief: (state) => (id) => {
      const program = state.programs.find(p => p.id === id)
      return program ? { id: program.id, name: program.name } : null
    },
    
    getYearsByProgram: (state) => (programId) => {
      const program = state.programs.find(p => p.id === programId)
      return program ? program.years : []
    },
    
    getSpecializationsByProgram: (state) => (programId) => {
      const program = state.programs.find(p => p.id === programId)
      return program ? program.specializations : []
    }
  },
  
  actions: {
    addProgram(program) {
      const id = Math.max(...this.programs.map(p => p.id)) + 1
      this.programs.push({
        ...program,
        id,
        years: [],
        specializations: []
      })
    },
    
    updateProgram(id, updates) {
      const index = this.programs.findIndex(program => program.id === id)
      if (index !== -1) {
        this.programs[index] = { ...this.programs[index], ...updates }
      }
    },
    
    deleteProgram(id) {
      const index = this.programs.findIndex(program => program.id === id)
      if (index !== -1) {
        this.programs.splice(index, 1)
      }
    },
    
    addSubject(subject) {
      const id = Math.max(...this.subjects.map(s => s.id)) + 1
      this.subjects.push({ ...subject, id })
    }
  }
})