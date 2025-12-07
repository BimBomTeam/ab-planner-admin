<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Zarządzanie Przedmiotami</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj przedmiot
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="subjectsStore.subjects"
        :loading="loading"
      >
        <template #item.actions="{ item }">
          <v-icon
            size="small"
            class="mr-2"
            @click="openDialog(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="error"
            @click="deleteSubject(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedId ? 'Edytuj przedmiot' : 'Nowy przedmiot' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Nazwa przedmiotu"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.code"
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
          <v-btn color="blue-darken-1" variant="text" @click="close">
            Anuluj
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="save">
            Zapisz
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useSubjectsStore } from '@/stores/subjects'

export default {
  name: 'SubjectsView',
  setup() {
    const subjectsStore = useSubjectsStore()
    const dialog = ref(false)
    const editedId = ref(null)
    const editedItem = ref({
      name: '',
      code: ''
    })

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Nazwa', key: 'name' },
      { title: 'Kod', key: 'code' },
      { title: 'Akcje', key: 'actions', sortable: false }
    ]

    const loading = computed(() => subjectsStore.loading)

    const openDialog = (item = null) => {
      if (item) {
        editedId.value = item.id
        editedItem.value = { ...item }
      } else {
        editedId.value = null
        editedItem.value = { name: '', code: '' }
      }
      dialog.value = true
    }

    const close = () => {
      dialog.value = false
      editedId.value = null
    }

    const save = async () => {
      if (editedId.value) {
        await subjectsStore.updateSubject(editedId.value, editedItem.value)
      } else {
        await subjectsStore.createSubject(editedItem.value)
      }
      close()
    }

    const deleteSubject = async (item) => {
      if (confirm('Potwierdź usunięcie przedmiotu')) {
        await subjectsStore.deleteSubject(item.id)
      }
    }

    onMounted(() => {
      subjectsStore.fetchSubjects()
    })

    return {
      subjectsStore,
      headers,
      dialog,
      editedId,
      editedItem,
      loading,
      openDialog,
      close,
      save,
      deleteSubject
    }
  }
}
</script>
