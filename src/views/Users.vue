<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Użytkownicy</h1>
      <v-btn color="primary" @click="showAddDialog = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj użytkownika
      </v-btn>
    </div>

    <!-- Filtry -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Szukaj użytkownika"
              variant="outlined"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="roleFilter"
              :items="roleOptions"
              label="Filtruj po roli"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabela użytkowników -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :search="search"
        item-value="id"
      >
        <template #item.role="{ item }">
          <v-chip
            :color="getRoleColor(item.role)"
            size="small"
            variant="tonal"
          >
            {{ getRoleLabel(item.role) }}
          </v-chip>
        </template>
        
        <template #item.name="{ item }">
          {{ item.first_name }} {{ item.last_name }}
        </template>
        
        <template #item.active="{ item }">
          <v-icon :color="item.active ? 'success' : 'error'">
            {{ item.active ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>
        
        <template #item.actions="{ item }">
          <v-icon
            class="me-2"
            size="small"
            @click="editUser(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            @click="deleteUser(item)"
            color="error"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog dodawania/edycji użytkownika -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editedUser.id ? 'Edytuj' : 'Dodaj' }} użytkownika</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedUser.first_name"
                  label="Imię"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedUser.last_name"
                  label="Nazwisko"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedUser.username"
                  label="Nazwa użytkownika"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editedUser.phone"
                  label="Telefon"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="editedUser.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="editedUser.role"
                  :items="roleOptions"
                  item-title="text"
                  item-value="value"
                  label="Rola"
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
          <v-btn color="primary" @click="saveUser">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć użytkownika {{ userToDelete?.first_name }} {{ userToDelete?.last_name }}?
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
import { useUsersStore } from '@/stores/users'

export default {
  name: 'Users',
  setup() {
    const usersStore = useUsersStore()
    return { usersStore }
  },
  data() {
    return {
      search: '',
      roleFilter: null,
      showAddDialog: false,
      showDeleteDialog: false,
      editedUser: {},
      userToDelete: null,
      headers: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Imię i Nazwisko', key: 'name', sortable: true },
        { title: 'Username', key: 'username', sortable: true },
        { title: 'Email', key: 'email', sortable: true },
        { title: 'Rola', key: 'role', width: '120px' },
        { title: 'Aktywny', key: 'active', width: '100px' },
        { title: 'Telefon', key: 'phone' },
        { title: 'Akcje', key: 'actions', width: '120px', sortable: false }
      ]
    }
  },
  computed: {
    filteredUsers() {
      let users = this.usersStore.allUsers
      
      if (this.roleFilter) {
        users = users.filter(user => user.role === this.roleFilter)
      }
      
      return users
    },
    
    roleOptions() {
      return [
        { text: 'Wszyscy', value: null },
        { text: 'Student', value: 'student' },
        { text: 'Wykładowca', value: 'teacher' },
        { text: 'Administrator', value: 'admin' }
      ]
    }
  },
  methods: {
    editUser(user) {
      this.editedUser = { ...user }
      this.showAddDialog = true
    },
    
    deleteUser(user) {
      this.userToDelete = user
      this.showDeleteDialog = true
    },
    
    confirmDelete() {
      if (this.userToDelete) {
        this.usersStore.deleteUser(this.userToDelete.id)
        this.showDeleteDialog = false
        this.userToDelete = null
      }
    },
    
    saveUser() {
      if (this.editedUser.id) {
        this.usersStore.updateUser(this.editedUser.id, this.editedUser)
      } else {
        this.usersStore.addUser(this.editedUser)
      }
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.editedUser = {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        role: 'student',
        active: true,
        phone: ''
      }
    },
    
    getRoleColor(role) {
      switch (role) {
        case 'admin': return 'error'
        case 'teacher': return 'warning'
        case 'student': return 'primary'
        default: return 'secondary'
      }
    },
    
    getRoleLabel(role) {
      switch (role) {
        case 'admin': return 'Administrator'
        case 'teacher': return 'Wykładowca'
        case 'student': return 'Student'
        default: return role
      }
    }
  },
  
  mounted() {
    this.closeDialog()
  }
}
</script>