<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Zarządzanie Salami</h1>
      <v-btn color="primary" @click="openDialog()">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj salę
      </v-btn>
    </div>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="roomsStore.rooms"
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
            @click="deleteRoom(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedId ? 'Edytuj salę' : 'Nowa sala' }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.number"
                  label="Numer sali"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.building"
                  label="Budynek"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.capacity"
                  label="Pojemność"
                  type="number"
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
import { useRoomsStore } from '@/stores/rooms'

export default {
  name: 'RoomsView',
  setup() {
    const roomsStore = useRoomsStore()
    const dialog = ref(false)
    const editedId = ref(null)
    const editedItem = ref({
      number: '',
      building: '',
      capacity: 30
    })

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Numer', key: 'number' },
      { title: 'Budynek', key: 'building' },
      { title: 'Pojemność', key: 'capacity' },
      { title: 'Akcje', key: 'actions', sortable: false }
    ]

    const loading = computed(() => roomsStore.loading)

    const openDialog = (item = null) => {
      if (item) {
        editedId.value = item.id
        editedItem.value = { ...item }
      } else {
        editedId.value = null
        editedItem.value = { number: '', building: '', capacity: 30 }
      }
      dialog.value = true
    }

    const close = () => {
      dialog.value = false
      editedId.value = null
    }

    const save = async () => {
      if (editedId.value) {
        await roomsStore.updateRoom(editedId.value, editedItem.value)
      } else {
        await roomsStore.createRoom(editedItem.value)
      }
      close()
    }

    const deleteRoom = async (item) => {
      if (confirm('Potwierdź usunięcie sali')) {
        await roomsStore.deleteRoom(item.id)
      }
    }

    onMounted(() => {
      roomsStore.fetchRooms()
    })

    return {
      roomsStore,
      headers,
      dialog,
      editedId,
      editedItem,
      loading,
      openDialog,
      close,
      save,
      deleteRoom
    }
  }
}
</script>
