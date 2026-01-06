<template>
  <div>
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-6 gap-4">
      <h1 class="text-h4 mb-3 mb-sm-0">Programy studiów</h1>
      <v-btn color="primary" variant="tonal" @click="showAddDialog = true" block class="d-sm-none">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj program
      </v-btn>
      <v-btn color="primary" variant="tonal" @click="showAddDialog = true" class="d-none d-sm-flex">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj program
      </v-btn>
    </div>

    <!-- Lista programów -->
    <!-- Tabela programów -->
    <v-card>
      <v-data-table :headers="headers" :items="programsStore.programs" :loading="programsStore.loading">
        <template #item.years="{ item }">
          <div v-if="item.years && item.years.length > 0">
            <v-chip v-for="year in item.years" :key="year.id" class="mr-1 mb-1" size="small" variant="outlined">
              {{ year.year }} rok
            </v-chip>
          </div>
          <span v-else class="text-grey text-caption">Brak danych</span>
        </template>

        <template #item.specializations="{ item }">
          <div v-if="item.specializations && item.specializations.length > 0">
            <v-chip v-for="spec in item.specializations" :key="spec.id" class="mr-1 mb-1" size="small" color="success"
              variant="tonal">
              {{ spec.name }}
            </v-chip>
          </div>
          <span v-else class="text-grey text-caption">Brak danych</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-icon size="small" class="mr-2" @click="editProgram(item)">
              mdi-pencil
            </v-icon>
            <v-icon size="small" color="error" @click="deleteProgram(item)">
              mdi-delete
            </v-icon>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-6">
            <v-icon size="40" color="grey-lighten-2" class="mb-2">mdi-school-outline</v-icon>
            <div class="text-grey">Brak programów studiów</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

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
                <v-text-field v-model="editedProgram.name" label="Nazwa programu" variant="outlined" density="compact"
                  required></v-text-field>
              </v-col>

              <!-- Zarządzanie latami studiów -->
              <v-col cols="12">
                <div class="mb-3">
                  <v-chip v-for="year in editedProgram.years" :key="year.id" class="mr-2 mb-2" closable
                    @click:close="removeYear(year.id)">
                    Rok {{ year.year }}
                  </v-chip>
                </div>
                <v-select v-model="newYear" :items="availableYears" label="Dodaj rok studiów" variant="outlined"
                  density="compact" class="mb-2"></v-select>
                <v-btn @click="addYear" :disabled="!newYear" color="primary" variant="tonal" block>
                  <v-icon size="16" class="mr-1">mdi-plus</v-icon>
                  Dodaj rok studiów
                </v-btn>
              </v-col>

              <!-- Zarządzanie specjalizacjami -->
              <v-col cols="12">
                <div class="mb-3">
                  <v-chip v-for="spec in editedProgram.specializations" :key="spec.id" class="mr-2 mb-2" closable
                    @click:close="removeSpecialization(spec.id)">
                    {{ spec.name }}
                  </v-chip>
                </div>
                <v-text-field v-model="newSpecialization" label="Nazwa specjalizacji" variant="outlined"
                  density="compact" class="mb-2" @keyup.enter="addSpecialization"></v-text-field>
                <v-btn @click="addSpecialization" :disabled="!newSpecialization" color="primary" variant="tonal" block>
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
          <v-btn color="primary" variant="text" @click="saveProgram" :disabled="!isFormValid">Zapisz</v-btn>
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
          <v-btn color="error" variant="text" @click="confirmDelete">Usuń</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmYearDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
        <v-card-text>Czy na pewno chcesz usunąć ten rok studiów?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showConfirmYearDialog = false">Anuluj</v-btn>
          <v-btn color="error" variant="text" @click="confirmRemoveYear">Usuń</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmSpecDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
        <v-card-text>Czy na pewno chcesz usunąć tę specjalizację?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showConfirmSpecDialog = false">Anuluj</v-btn>
          <v-btn color="error" variant="text" @click="confirmRemoveSpec">Usuń</v-btn>
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
      headers: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Nazwa Programu', key: 'name' },
        { title: 'Lata Studiów', key: 'years' },
        { title: 'Specjalizacje', key: 'specializations' },
        { title: 'Akcje', key: 'actions', sortable: false, align: 'end' }
      ],
      showAddDialog: false,
      showDeleteDialog: false,
      programToDelete: null,
      showConfirmYearDialog: false,
      yearToDeleteId: null,
      showConfirmSpecDialog: false,
      specToDeleteId: null,
      newYear: null,
      newSpecialization: '',
      editedProgram: {
        name: '',
        years: [],
        specializations: []
      }
    }
  },

  computed: {
    availableYears() {
      return [1, 2, 3, 4, 5].filter(year =>
        !(this.editedProgram.years || []).some(y => y.year === year)
      )
    },
    isFormValid() {
      return !!this.editedProgram.name
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

    async confirmDelete() {
      if (this.programToDelete) {
        try {
          await this.programsStore.deleteProgram(this.programToDelete.id)
          this.showDeleteDialog = false
          this.programToDelete = null
        } catch (error) {
          // Error handled by global interceptor
          console.debug('Delete failed', error)
        }
      }
    },

    async saveProgram() {
      try {
        if (this.editedProgram.id) {
          await this.programsStore.updateProgram(this.editedProgram.id, this.editedProgram)
        } else {
          await this.programsStore.addProgram(this.editedProgram)
        }
        this.closeDialog()
      } catch (error) {
        console.error('Failed to save program:', error)
        // Optionally show error notification
      }
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
      if (!this.newYear) return

      if (this.editedProgram.id) {
        await this.programsStore.addYear(this.editedProgram.id, this.newYear)
        const updated = this.programsStore.getProgramById(this.editedProgram.id)
        if (updated) {
          this.editedProgram.years = [...updated.years]
        }
      } else {
        // Local add for new program
        this.editedProgram.years.push({ year: this.newYear, id: Date.now() })
      }
      this.newYear = null
    },

    async removeYear(yearId) {
      if (this.editedProgram.id) {
        if (confirm('Czy na pewno chcesz usunąć ten rok?')) {
          await this.programsStore.deleteYear(yearId)
          const updated = this.programsStore.getProgramById(this.editedProgram.id)
          if (updated) {
            this.editedProgram.years = [...updated.years]
          }
        }
      } else {
        // Local remove
        this.editedProgram.years = this.editedProgram.years.filter(y => y.id !== yearId)
      }
    },

    async addSpecialization() {
      if (!this.newSpecialization) return

      if (this.editedProgram.id) {
        await this.programsStore.addSpecialization(this.editedProgram.id, this.newSpecialization)
        const updated = this.programsStore.getProgramById(this.editedProgram.id)
        if (updated) {
          this.editedProgram.specializations = [...updated.specializations]
        }
      } else {
        // Local add
        this.editedProgram.specializations.push({ name: this.newSpecialization, id: Date.now() })
      }
      this.newSpecialization = ''
    },

    async removeSpecialization(specId) {
      if (this.editedProgram.id) {
        if (confirm('Czy na pewno chcesz usunąć tę specjalizację?')) {
          await this.programsStore.deleteSpecialization(specId)
          const updated = this.programsStore.getProgramById(this.editedProgram.id)
          if (updated) {
            this.editedProgram.specializations = [...updated.specializations]
          }
        }
      } else {
        // Local remove
        this.editedProgram.specializations = this.editedProgram.specializations.filter(s => s.id !== specId)
      }
    }
  },

  mounted() {
    this.programsStore.fetchPrograms()
  }
}
</script>
