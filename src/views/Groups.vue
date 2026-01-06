<template>
  <div>
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-6">
      <h1 class="text-h4 mb-4 mb-sm-0">Grupy</h1>
      <v-btn color="primary" variant="tonal" @click="showAddDialog = true" class="w-100 w-sm-auto">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj grupę
      </v-btn>
    </div>

    <!-- Filtry -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Szukaj grupy" variant="outlined"
              density="compact" hide-details></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="programFilter" :items="programOptions" label="Program" variant="outlined"
              density="compact" hide-details clearable></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="typeFilter" :items="groupsStore.groupTypes" item-title="label" item-value="code"
              label="Typ grupy" variant="outlined" density="compact" hide-details clearable></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista grup -->
    <v-card>
      <v-data-table :headers="headers" :items="filteredGroups" :search="search" item-value="id"
        no-data-text="Brak danych">
        <template #item.program="{ item }">
          <v-chip color="primary" size="small" variant="tonal">
            {{ item.program.name }}
          </v-chip>
        </template>

        <template #item.year="{ item }">
          <v-chip color="info" size="small" variant="outlined">
            {{ item.year.year }} rok
          </v-chip>
        </template>

        <template #item.specialization="{ item }">
          <v-chip color="success" size="small" variant="tonal">
            {{ item.specialization.name }}
          </v-chip>
        </template>

        <template #item.group_type="{ item }">
          <v-chip :color="getTypeColor(item.group_type.code)" size="small" variant="outlined">
            {{ getGroupTypeLabel(item.group_type.code) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-icon class="me-2" size="small" @click="editGroup(item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" @click="deleteGroup(item)" color="error">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog dodawania/edycji grupy -->
    <v-dialog v-model="showAddDialog" max-width="700px">
      <v-card>
        <v-card-title class="pa-6 pb-4">
          <span class="text-h5">{{ editedGroup.id ? 'Edytuj' : 'Dodaj' }} grupę</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="editedGroup.code" label="Kod grupy" variant="outlined" required></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="editedGroup.program" :items="programsStore.programs" item-title="name"
                  item-value="id" label="Program" variant="outlined" required return-object
                  @update:modelValue="onProgramChange"></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="editedGroup.year" :items="availableYears"
                  :item-title="item => item.label || `${item.year} rok`" item-value="id" label="Rok studiów"
                  variant="outlined" required return-object :disabled="!editedGroup.program"></v-select>
              </v-col>

              <v-col cols="12" md="6">
                <v-select v-model="editedGroup.specialization" :items="availableSpecializations" item-title="name"
                  item-value="id" label="Specjalizacja" variant="outlined" required return-object
                  :disabled="!editedGroup.program"></v-select>
              </v-col>

              <v-col cols="12">
                <v-select v-model="editedGroup.group_type" :items="groupsStore.groupTypes" item-title="label"
                  item-value="code" label="Typ grupy" variant="outlined" required return-object></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
          <v-btn color="primary" variant="text" @click="saveGroup" :disabled="!isFormValid">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć grupę {{ groupToDelete?.code }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Anuluj</v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete">Usuń</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useGroupsStore } from '@/stores/groups'
import { useProgramsStore } from '@/stores/programs'

export default {
  name: 'Groups',
  setup() {
    const groupsStore = useGroupsStore()
    const programsStore = useProgramsStore()
    return { groupsStore, programsStore }
  },
  data() {
    return {
      search: '',
      programFilter: null,
      typeFilter: null,
      showAddDialog: false,
      showDeleteDialog: false,
      editedGroup: {},
      groupToDelete: null,
      headers: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Kod', key: 'code' },
        { title: 'Program', key: 'program' },
        { title: 'Rok', key: 'year' },
        { title: 'Specjalizacja', key: 'specialization' },
        { title: 'Typ', key: 'group_type' },
        { title: 'Akcje', key: 'actions', sortable: false, width: '120px' }
      ]
    }
  },
  computed: {
    filteredGroups() {
      let groups = this.groupsStore.groups

      if (this.programFilter) {
        groups = groups.filter(group => group.program.id === this.programFilter)
      }

      if (this.typeFilter) {
        groups = groups.filter(group => group.group_type.code === this.typeFilter)
      }

      return groups
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
    availableYears() {
      if (!this.editedGroup.program || !this.editedGroup.program.id) return []

      const program = this.programsStore.programs.find(p => p.id == this.editedGroup.program.id)

      return (program && program.years) ? program.years.map(year => ({
        ...year,
        label: `${year.year} rok`
      })) : []
    },
    availableSpecializations() {
      if (!this.editedGroup.program || !this.editedGroup.program.id) return []

      const program = this.programsStore.programs.find(p => p.id == this.editedGroup.program.id)
      return (program && program.specializations) ? program.specializations : []
    },
    isFormValid() {
      return !!this.editedGroup.code &&
        !!this.editedGroup.program &&
        !!this.editedGroup.year &&
        !!this.editedGroup.specialization &&
        !!this.editedGroup.group_type
    }
  },
  methods: {
    editGroup(group) {
      this.editedGroup = { ...group }

      // Map group_type to the object from store to ensure correct label display in select
      if (this.editedGroup.group_type && this.editedGroup.group_type.code) {
        const storeType = this.groupsStore.groupTypes.find(t => t.code === this.editedGroup.group_type.code)
        if (storeType) {
          this.editedGroup.group_type = storeType
        }
      }

      this.showAddDialog = true
    },

    deleteGroup(group) {
      this.groupToDelete = group
      this.showDeleteDialog = true
    },

    confirmDelete() {
      if (this.groupToDelete) {
        this.groupsStore.deleteGroup(this.groupToDelete.id)
        this.showDeleteDialog = false
        this.groupToDelete = null
      }
    },

    async saveGroup() {
      const payload = {
        code: this.editedGroup.code,
        program_id: this.editedGroup.program?.id,
        program_year_id: this.editedGroup.year?.id,
        specialization_id: this.editedGroup.specialization?.id,
        group_type: this.editedGroup.group_type?.code
      }

      if (this.editedGroup.id) {
        await this.groupsStore.updateGroup(this.editedGroup.id, payload)
      } else {
        await this.groupsStore.createGroup(payload)
      }
      this.closeDialog()
    },

    closeDialog() {
      this.showAddDialog = false
      this.editedGroup = {}
    },

    onProgramChange() {
      // Resetuj rok i specjalizację gdy zmienia się program
      this.editedGroup.year = null
      this.editedGroup.specialization = null
    },

    getTypeColor(typeCode) {
      switch (typeCode) {
        case 'lecture': return 'blue'
        case 'lab': return 'green'
        case 'seminar': return 'orange'
        case 'project': return 'purple'
        default: return 'grey'
      }
    },

    getGroupTypeLabel(code) {
      const type = this.groupsStore.groupTypes.find(t => t.code === code)
      return type ? type.label : code
    }
  },
  mounted() {
    this.groupsStore.fetchGroups()
    this.programsStore.fetchPrograms()
  }
}
</script>
