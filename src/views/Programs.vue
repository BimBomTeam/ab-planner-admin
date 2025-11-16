<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Programy studiów</h1>
      <v-btn color="primary" @click="showAddDialog = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj program
      </v-btn>
    </div>

    <!-- Lista programów -->
    <v-row>
      <v-col
        v-for="program in programsStore.programs"
        :key="program.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ program.name }}</span>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  v-bind="props"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="editProgram(program)">
                  <v-list-item-title>
                    <v-icon class="mr-2">mdi-pencil</v-icon>
                    Edytuj
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteProgram(program)" class="text-error">
                  <v-list-item-title>
                    <v-icon class="mr-2">mdi-delete</v-icon>
                    Usuń
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-title>
          
          <v-card-text>
            <div class="mb-4">
              <v-chip
                class="mr-2 mb-2"
                size="small"
                color="primary"
                variant="tonal"
              >
                ID: {{ program.id }}
              </v-chip>
            </div>
            
            <div class="mb-3">
              <h4 class="text-subtitle-1 mb-2">Lata studiów:</h4>
              <v-chip
                v-for="year in program.years"
                :key="year.id"
                class="mr-1 mb-1"
                size="small"
                variant="outlined"
              >
                {{ year.year }} rok
              </v-chip>
              <div v-if="program.years.length === 0" class="text-grey">
                Brak lat studiów
              </div>
            </div>
            
            <div>
              <h4 class="text-subtitle-1 mb-2">Specjalizacje:</h4>
              <v-chip
                v-for="spec in program.specializations"
                :key="spec.id"
                class="mr-1 mb-1"
                size="small"
                color="success"
                variant="tonal"
              >
                {{ spec.name }}
              </v-chip>
              <div v-if="program.specializations.length === 0" class="text-grey">
                Brak specjalizacji
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog dodawania/edycji programu -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedProgram.id ? 'Edytuj' : 'Dodaj' }} program</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedProgram.name"
                  label="Nazwa programu"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <!-- Zarządzanie latami studiów -->
              <v-col cols="12">
                <h4 class="mb-3">Lata studiów</h4>
                <div class="mb-3">
                  <v-chip
                    v-for="year in editedProgram.years"
                    :key="year.id"
                    class="mr-2 mb-2"
                    closable
                    @click:close="removeYear(year.id)"
                  >
                    Rok {{ year.year }}
                  </v-chip>
                </div>
                <div class="d-flex gap-2">
                  <v-select
                    v-model="newYear"
                    :items="availableYears"
                    label="Dodaj rok studiów"
                    variant="outlined"
                    density="compact"
                    style="width: 200px;"
                  ></v-select>
                  <v-btn
                    @click="addYear"
                    :disabled="!newYear"
                    color="primary"
                    variant="outlined"
                  >
                    Dodaj
                  </v-btn>
                </div>
              </v-col>
              
              <!-- Zarządzanie specjalizacjami -->
              <v-col cols="12">
                <h4 class="mb-3">Specjalizacje</h4>
                <div class="mb-3">
                  <v-chip
                    v-for="spec in editedProgram.specializations"
                    :key="spec.id"
                    class="mr-2 mb-2"
                    closable
                    @click:close="removeSpecialization(spec.id)"
                  >
                    {{ spec.name }}
                  </v-chip>
                </div>
                <div class="d-flex gap-2">
                  <v-text-field
                    v-model="newSpecialization"
                    label="Nazwa specjalizacji"
                    variant="outlined"
                    density="compact"
                    @keyup.enter="addSpecialization"
                  ></v-text-field>
                  <v-btn
                    @click="addSpecialization"
                    :disabled="!newSpecialization"
                    color="success"
                    variant="outlined"
                  >
                    Dodaj
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
          <v-btn color="primary" @click="saveProgram">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć program {{ programToDelete?.name }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Anuluj</v-btn>
          <v-btn color="error" @click="confirmDelete">Usuń</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sekcja przedmiotów -->
    <div class="mt-8">
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h5">Przedmioty</h2>
        <v-btn color="success" @click="showSubjectDialog = true">
          <v-icon class="mr-2">mdi-plus</v-icon>
          Dodaj przedmiot
        </v-btn>
      </div>

      <v-card>
        <v-data-table
          :headers="subjectHeaders"
          :items="programsStore.subjects"
          item-value="id"
        >
          <template #item.actions="{ item }">
            <v-icon
              size="small"
              @click="deleteSubject(item)"
              color="error"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!-- Dialog dodawania przedmiotu -->
    <v-dialog v-model="showSubjectDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Dodaj przedmiot</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newSubject.name"
                  label="Nazwa przedmiotu"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newSubject.code"
                  label="Kod przedmiotu"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeSubjectDialog">Anuluj</v-btn>
          <v-btn color="success" @click="saveSubject">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useProgramsStore } from '@/stores/programs'

export default {
  name: 'Programs',
  setup() {
    const programsStore = useProgramsStore()
    return { programsStore }
  },
  data() {
    return {
      showAddDialog: false,
      showDeleteDialog: false,
      showSubjectDialog: false,
      editedProgram: {
        name: '',
        years: [],
        specializations: []
      },
      programToDelete: null,
      newSubject: {
        name: '',
        code: ''
      },
      newYear: null,
      newSpecialization: '',
      subjectHeaders: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Nazwa', key: 'name' },
        { title: 'Kod', key: 'code' },
        { title: 'Akcje', key: 'actions', sortable: false, width: '120px' }
      ]
    }
  },
  
  computed: {
    availableYears() {
      return [1, 2, 3, 4, 5].filter(year => 
        !(this.editedProgram.years || []).some(y => y.year === year)
      )
    }
  },
  methods: {
    editProgram(program) {
      this.editedProgram = {
        ...program,
        years: [...(program.years || [])],
        specializations: [...(program.specializations || [])]
      }
      this.showAddDialog = true
    },
    
    deleteProgram(program) {
      this.programToDelete = program
      this.showDeleteDialog = true
    },
    
    confirmDelete() {
      if (this.programToDelete) {
        this.programsStore.deleteProgram(this.programToDelete.id)
        this.showDeleteDialog = false
        this.programToDelete = null
      }
    },
    
    saveProgram() {
      if (this.editedProgram.id) {
        this.programsStore.updateProgram(this.editedProgram.id, this.editedProgram)
      } else {
        this.programsStore.addProgram(this.editedProgram)
      }
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.editedProgram = {
        name: '',
        years: [],
        specializations: []
      }
      this.newYear = null
      this.newSpecialization = ''
    },

    addYear() {
      if (!this.editedProgram.years) {
        this.editedProgram.years = []
      }
      if (this.newYear && !this.editedProgram.years.some(y => y.year === this.newYear)) {
        const newId = Math.max(...this.editedProgram.years.map(y => y.id), 0) + 1
        this.editedProgram.years.push({
          id: newId,
          program_id: this.editedProgram.id || null,
          year: this.newYear
        })
        this.newYear = null
      }
    },

    removeYear(yearId) {
      if (this.editedProgram.years) {
        this.editedProgram.years = this.editedProgram.years.filter(y => y.id !== yearId)
      }
    },

    addSpecialization() {
      if (!this.editedProgram.specializations) {
        this.editedProgram.specializations = []
      }
      if (this.newSpecialization && !this.editedProgram.specializations.some(s => s.name === this.newSpecialization)) {
        const newId = Math.max(...this.editedProgram.specializations.map(s => s.id), 0) + 1
        this.editedProgram.specializations.push({
          id: newId,
          program_id: this.editedProgram.id || null,
          name: this.newSpecialization
        })
        this.newSpecialization = ''
      }
    },

    removeSpecialization(specId) {
      if (this.editedProgram.specializations) {
        this.editedProgram.specializations = this.editedProgram.specializations.filter(s => s.id !== specId)
      }
    },

    saveSubject() {
      this.programsStore.addSubject(this.newSubject)
      this.closeSubjectDialog()
    },

    closeSubjectDialog() {
      this.showSubjectDialog = false
      this.newSubject = { name: '', code: '' }
    },

    deleteSubject(subject) {
      // Implementacja usuwania przedmiotu
      const index = this.programsStore.subjects.findIndex(s => s.id === subject.id)
      if (index !== -1) {
        this.programsStore.subjects.splice(index, 1)
      }
    }
  },
  
  mounted() {
    this.closeDialog()
  }
}
</script>