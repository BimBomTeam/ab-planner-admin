<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Użytkownicy</h1>
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
              item-title="text"
              item-value="value"
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
        no-data-text="Brak danych"
      >
        <template #item.role="{ item }">
          <v-chip
            :color="getRoleColor(item.role?.code)"
            size="small"
            variant="tonal"
          >
            {{ getRoleLabel(item.role?.code) }}
          </v-chip>
        </template>
        
        <template #item.name="{ item }">
          {{ item.name }}
        </template>
        
        <template #item.actions="{ item }">
          <v-icon
            class="me-2"
            size="small"
            @click="editUser(item)"
          >
            mdi-pencil
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog dodawania/edycji użytkownika -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-6 pb-4">
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
        <v-card-title class="text-h5 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
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
        { title: 'Email', key: 'email', sortable: true },
        { title: 'Rola', key: 'role', width: '120px' },
        { title: 'Akcje', key: 'actions', width: '120px', sortable: false }
      ]
    }
  },
  computed: {
    filteredUsers() {
      let users = this.usersStore.allUsers
      
      if (this.roleFilter) {
        users = users.filter(user => user.role?.code === this.roleFilter)
      }
      
      return users
    },
    
    roleOptions() {
      return [
        { text: 'Wszyscy', value: null },
        ...this.usersStore.allRoles.map(role => ({
          text: role.label,
          value: role.code
        }))
      ]
    }
  },
  methods: {
    editUser(user) {
      this.editedUser = { ...user }
      // Fix role object to code string for v-select
      if (this.editedUser.role && typeof this.editedUser.role === 'object') {
        this.editedUser.role = this.editedUser.role.code
      }
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
        // Find role id based on value
        // Note: API needs role_id (int), but dialog uses code string. 
        // We need a mapping or get role object.
        // Assuming simplistic mapping for now based on what we see in store/API mocks.
        // Actually, API /users/{id}/role expects { role_id: int }. 
        // We need to know role IDs.
        // The store defines roles implicitly or we need to fetch them? 
        // The API output shows Role object { id, code, label }.
        // Let's assume we can find the role object from the code selected.
        
        // This is tricky without a Roles store or fetching roles.
        // However, we can try to guess or use the selection to drive it.
        // Let's update the store to handle this or just pass the role_id if we have it.
        // But the dialog v-select uses 'value' which is string code.
        
        // We need a fetchRoles? Or hardcode IDs if they are static?
        // Let's assume standard IDs: 1: student, 2: teacher, 3: admin
        
        if (this.editedUser.role) {
             this.usersStore.updateUserRole(this.editedUser.id, this.editedUser.role)
        }
      } 
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.editedUser = {}
    },
    
    getRoleColor(role) {
      switch (role) {
        case 'admin': return 'error'
        case 'lecturer': return 'warning'
        case 'student': return 'primary'
        default: return 'secondary'
      }
    },
    
    getRoleLabel(role) {
      switch (role) {
        case 'admin': return 'Administrator'
        case 'lecturer': return 'Wykładowca'
        case 'student': return 'Student'
        default: return role
      }
    }
  },
  
  mounted() {
    this.usersStore.fetchUsers()
  }
}
</script>
