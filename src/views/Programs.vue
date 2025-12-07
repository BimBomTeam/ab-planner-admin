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

    <!-- Loading state -->
    <div v-if="programsStore.loading" class="d-flex justify-center align-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Empty state -->
    <div v-else-if="programsStore.programs.length === 0" class="text-center py-12">
      <v-icon size="80" color="grey-lighten-2">mdi-school-outline</v-icon>
      <h3 class="text-h5 text-grey mt-4">Brak programów studiów</h3>
      <p class="text-grey mb-6">Lista jest pusta. Dodaj pierwszy program przyciskiem powyżej.</p>
    </div>

    <!-- Dialog dodawania/edycji programu -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-6 pb-4">
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
                  density="compact"
                  required
                ></v-text-field>
              </v-col>
              
              <!-- Zarządzanie latami studiów -->
              <v-col cols="12">
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
                <v-select
                  v-model="newYear"
                  :items="availableYears"
                  label="Dodaj rok studiów"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                ></v-select>
                <v-btn
                  @click="addYear"
                  :disabled="!newYear"
                  color="primary"
                  variant="flat"
                  block
                >
                  <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                  Dodaj rok studiów
                </v-btn>
              </v-col>
              
              <!-- Zarządzanie specjalizacjami -->
              <v-col cols="12">
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
                <v-text-field
                  v-model="newSpecialization"
                  label="Nazwa specjalizacji"
                  variant="outlined"
                  density="compact"
                  class="mb-2"
                  @keyup.enter="addSpecialization"
                ></v-text-field>
                <v-btn
                  @click="addSpecialization"
                  :disabled="!newSpecialization"
                  color="success"
                  variant="flat"
                  block
                >
                  <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                  Dodaj specjalizację
                </v-btn>
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
        <v-card-title class="text-h5 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
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
      programToDelete: null,
      newYear: null,
      newSpecialization: ''
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

    async addYear() {
        if (this.newYear && this.editedProgram.id) {
            await this.programsStore.addYear(this.editedProgram.id, this.newYear)
            // Refresh local data from store after update
            // Ideally we should just use the store data directly in the loop, 
            // but the dialog uses a copy 'editedProgram'. 
            // We need to re-sync editedProgram or close/re-open.
            // For simplicity, let's close and re-open or just fetch fresh data.
            const updated = this.programsStore.getProgramById(this.editedProgram.id)
            if (updated) {
                this.editedProgram.years = [...updated.years]
            }
            this.newYear = null
        }
    },

    async removeYear(yearId) {
        if (confirm('Czy na pewno chcesz usunąć ten rok?') && this.editedProgram.id) {
            await this.programsStore.deleteYear(yearId)
             const updated = this.programsStore.getProgramById(this.editedProgram.id)
            if (updated) {
                this.editedProgram.years = [...updated.years]
            }
        }
    },

    async addSpecialization() {
         if (this.newSpecialization && this.editedProgram.id) {
            await this.programsStore.addSpecialization(this.editedProgram.id, this.newSpecialization)
            const updated = this.programsStore.getProgramById(this.editedProgram.id)
            if (updated) {
                this.editedProgram.specializations = [...updated.specializations]
            }
            this.newSpecialization = ''
        }
    },

    async removeSpecialization(specId) {
        if (confirm('Czy na pewno chcesz usunąć tę specjalizację?') && this.editedProgram.id) {
            await this.programsStore.deleteSpecialization(specId)
            const updated = this.programsStore.getProgramById(this.editedProgram.id)
            if (updated) {
                this.editedProgram.specializations = [...updated.specializations]
            }
        }
    }
  },
  
  mounted() {
    this.programsStore.fetchPrograms()
  }
}
</script>
