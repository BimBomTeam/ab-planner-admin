<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Wybory studentów</h1>
      <v-btn color="primary" @click="showAddDialog = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj wybór
      </v-btn>
    </div>

    <!-- Statystyki -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card color="primary" dark>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-3" size="40">mdi-account-check</v-icon>
            <div>
              <div class="text-h4">{{ totalSelections }}</div>
              <div>Łączna liczba wyborów</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-card color="success" dark>
          <v-card-text class="d-flex align-center">
            <v-icon class="mr-3" size="40">mdi-account-group</v-icon>
            <div>
              <div class="text-h4">{{ uniqueStudents }}</div>
              <div>Studenci z wyborami</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filtry -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="studentFilter"
              :items="students"
              item-title="email"
              item-value="id"
              label="Student"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="groupFilter"
              :items="groupOptions"
              label="Grupa"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="programFilter"
              :items="programOptions"
              label="Program"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista wyborów -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredSelections"
        item-value="id"
      >
        <template #item.user_id="{ item }">
          <div v-if="getUser(item.user_id)">
            <div class="font-weight-medium">{{ getUser(item.user_id).name }}</div>
            <div class="text-caption text-grey">{{ getUser(item.user_id).email }}</div>
            <v-chip
              size="x-small"
              color="success"
              variant="outlined"
              class="mt-1"
            >
              {{ getUser(item.user_id).role.label }}
            </v-chip>
          </div>
        </template>
        
        <template #item.group_id="{ item }">
          <div v-if="getGroup(item.group_id)">
            <v-chip
              color="primary"
              size="small"
              variant="tonal"
              class="mb-1"
            >
              {{ getGroup(item.group_id).code }}
            </v-chip>
            <div class="text-caption">
              {{ getGroup(item.group_id).program.name }}
            </div>
            <div class="text-caption text-grey">
              {{ getGroup(item.group_id).specialization.name }}
            </div>
          </div>
        </template>
        
        <template #item.group_type="{ item }">
          <v-chip
            v-if="getGroup(item.group_id)"
            :color="getTypeColor(getGroup(item.group_id).group_type.code)"
            size="small"
            variant="outlined"
          >
            {{ getGroup(item.group_id).group_type.label }}
          </v-chip>
        </template>
        
        <template #item.selected_at="{ item }">
          <div>
            <div>{{ formatDate(item.selected_at) }}</div>
            <div class="text-caption text-grey">{{ formatTime(item.selected_at) }}</div>
          </div>
        </template>
        
        <template #item.actions="{ item }">
          <v-icon
            size="small"
            @click="deleteSelection(item)"
            color="error"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Sekcja analizy grup -->
    <div class="mt-8">
      <h2 class="text-h5 mb-6">Analiza grup</h2>
      <v-row class="align-stretch">
        <v-col
          v-for="group in groupsWithSelections"
          :key="group.id"
          cols="12"
          md="6"
          lg="4"
          class="d-flex"
        >
          <v-card class="w-100 d-flex flex-column">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ group.code }}</span>
              <v-chip
                :color="getTypeColor(group.group_type.code)"
                size="small"
                variant="outlined"
              >
                {{ group.group_type.label }}
              </v-chip>
            </v-card-title>
            
            <v-card-text class="flex-grow-1 d-flex flex-column">
              <div class="mb-2">
                <strong>Program:</strong> {{ group.program.name }}
              </div>
              <div class="mb-2">
                <strong>Specjalizacja:</strong> {{ group.specialization.name }}
              </div>
              <div class="mb-3">
                <strong>Rok:</strong> {{ group.year.year }}
              </div>
              
              <v-divider class="my-3"></v-divider>
              
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-h6">Studenci:</span>
                <v-chip
                  color="info"
                  size="large"
                  variant="tonal"
                >
                  {{ group.studentCount }}
                </v-chip>
              </div>
              
              <div class="flex-grow-1 d-flex flex-column justify-start" style="min-height: 120px;">
                <v-list density="compact" v-if="group.students.length > 0" class="pa-0">
                  <v-list-item
                    v-for="student in group.students.slice(0, 3)"
                    :key="student.id"
                    density="compact"
                    class="px-0"
                  >
                    <v-list-item-title class="text-caption">
                      {{ student.name }}
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item v-if="group.students.length > 3" density="compact" class="px-0">
                    <v-list-item-title class="text-caption text-grey">
                      ... i {{ group.students.length - 3 }} więcej
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
                <div v-else class="text-caption text-grey pa-2">
                  Brak studentów
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Dialog dodawania wyboru -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-6 pb-4">
          <span class="text-h5">Dodaj wybór studenta</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="newSelection.user_id"
                  :items="students"
                  item-title="email"
                  item-value="id"
                  label="Student"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="newSelection.group_id"
                  :items="groupsStore.groups"
                  item-title="groupLabel"
                  item-value="id"
                  label="Grupa"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
          <v-btn color="primary" @click="saveSelection">Dodaj</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć wybór studenta?
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
import { useSelectionsStore } from '@/stores/selections'
import { useUsersStore } from '@/stores/users'
import { useGroupsStore } from '@/stores/groups'
import { useProgramsStore } from '@/stores/programs'

export default {
  name: 'StudentSelections',
  setup() {
    const selectionsStore = useSelectionsStore()
    const usersStore = useUsersStore()
    const groupsStore = useGroupsStore()
    const programsStore = useProgramsStore()
    return { selectionsStore, usersStore, groupsStore, programsStore }
  },
  data() {
    return {
      studentFilter: null,
      groupFilter: null,
      programFilter: null,
      showAddDialog: false,
      showDeleteDialog: false,
      selectionToDelete: null,
      newSelection: {
        user_id: null,
        group_id: null
      },
      headers: [
        { title: 'ID', key: 'id', width: '60px' },
        { title: 'Student', key: 'user_id' },
        { title: 'Grupa', key: 'group_id' },
        { title: 'Typ grupy', key: 'group_type' },
        { title: 'Data wyboru', key: 'selected_at' },
        { title: 'Akcje', key: 'actions', sortable: false, width: '100px' }
      ]
    }
  },
  computed: {
    filteredSelections() {
      let selections = this.selectionsStore.selections
      
      if (this.studentFilter) {
        selections = selections.filter(selection => selection.user_id === this.studentFilter)
      }
      
      if (this.groupFilter) {
        selections = selections.filter(selection => selection.group_id === this.groupFilter)
      }
      
      if (this.programFilter) {
        selections = selections.filter(selection => {
          const group = this.getGroup(selection.group_id)
          return group && group.program.id === this.programFilter
        })
      }
      
      return selections.sort((a, b) => new Date(b.selected_at) - new Date(a.selected_at))
    },
    studentOptions() {
      return [
        { title: 'Wszyscy', value: null },
        ...this.students.map(student => ({
          title: student.name,
          value: student.id
        }))
      ]
    },
    groupOptions() {
      return [
        { title: 'Wszystkie', value: null },
        ...this.groupsStore.groups.map(group => ({
          title: group.code,
          value: group.id
        }))
      ]
    },
    programOptions() {
      return [
        { title: 'Wszystkie', value: null },
        ...this.programsStore.programs.map(program => ({
          title: program.name,
          value: program.id
        }))
      ]
    },
    students() {
      return this.usersStore.getUsersByRole('student')
    },
    totalSelections() {
      return this.selectionsStore.selections.length
    },
    uniqueStudents() {
      const uniqueStudentIds = new Set(this.selectionsStore.selections.map(s => s.user_id))
      return uniqueStudentIds.size
    },
    groupsWithSelections() {
      return this.groupsStore.groups.map(group => {
        const selections = this.selectionsStore.getSelectionsByGroup(group.id)
        const students = selections.map(selection => 
          this.usersStore.getUserById(selection.user_id)
        ).filter(Boolean)
        
        return {
          ...group,
          studentCount: students.length,
          students
        }
      })
    }
  },
  methods: {
    deleteSelection(selection) {
      this.selectionToDelete = selection
      this.showDeleteDialog = true
    },
    
    confirmDelete() {
      if (this.selectionToDelete) {
        this.selectionsStore.deleteSelection(this.selectionToDelete.id)
        this.showDeleteDialog = false
        this.selectionToDelete = null
      }
    },
    
    saveSelection() {
      this.selectionsStore.addSelection(this.newSelection)
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.newSelection = {
        user_id: null,
        group_id: null
      }
    },
    
    getUser(userId) {
      return this.usersStore.getUserById(userId)
    },
    
    getGroup(groupId) {
      return this.groupsStore.getGroupById(groupId)
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('pl-PL')
    },
    
    formatTime(dateString) {
      return new Date(dateString).toLocaleTimeString('pl-PL', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    getTypeColor(typeCode) {
      switch (typeCode) {
        case 'lecture': return 'blue'
        case 'lab': return 'green'
        case 'seminar': return 'orange'
        case 'project': return 'purple'
        default: return 'grey'
      }
    }
  },
  mounted() {
    // Dodaj groupLabel do wszystkich grup
    this.groupsStore.groups.forEach(group => {
      group.groupLabel = `${group.code} - ${group.program.name} (${group.specialization.name})`
    })
  }
}
</script>