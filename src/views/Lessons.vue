<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Zajęcia</h1>
      <v-btn color="primary" @click="initNewLesson()">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Dodaj zajęcia
      </v-btn>
    </div>

    <!-- Filtry -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
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
          <v-col cols="12" md="3">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="dateFromFormatted"
                  label="Data od"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                  readonly
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateFrom"
                locale="pl"
                @update:model-value="updateDateFrom"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="3">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="dateToFormatted"
                  label="Data do"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-calendar"
                  readonly
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateTo"
                locale="pl"
                @update:model-value="updateDateTo"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista zajęć -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredLessons"
        item-value="id"
      >
        <template #item.subject="{ item }">
          <div v-if="item.subject">
            <div class="font-weight-medium">{{ item.subject.name }}</div>
            <div class="text-caption text-grey">{{ item.subject.code }}</div>
          </div>
          <span v-else class="text-grey">-</span>
        </template>
        
        <template #item.schedule="{ item }">
          <div>
            <div>{{ formatDate(item.starts_at) }}</div>
            <div class="text-caption">
              {{ formatTime(item.starts_at) }} - {{ formatTime(item.ends_at) }}
            </div>
          </div>
        </template>
        
        <template #item.room="{ item }">
          <v-chip
            v-if="item.room"
            color="info"
            size="small"
            variant="outlined"
          >
            {{ item.room.building }}/{{ item.room.number }}
          </v-chip>
          <span v-else class="text-grey">-</span>
        </template>
        
        <template #item.group="{ item }">
          <v-chip
            v-if="item.group"
            color="primary"
            size="small"
            variant="tonal"
          >
            {{ item.group.code }}
          </v-chip>
          <span v-else class="text-grey">-</span>
        </template>
        
        <template #item.lecturer="{ item }">
          <div v-if="item.lecturer">
            <div class="font-weight-medium">{{ item.lecturer.name }}</div>
            <div class="text-caption text-grey">{{ item.lecturer.email }}</div>
          </div>
          <span v-else class="text-grey">-</span>
        </template>
        
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>
        
        <template #item.lesson_type="{ item }">
          <v-chip
            :color="getTypeColor(item.lesson_type)"
            size="small"
            variant="outlined"
          >
            {{ getTypeLabel(item.lesson_type) }}
          </v-chip>
        </template>
        
        <template #item.actions="{ item }">
          <v-icon
            class="me-2"
            size="small"
            @click="editLesson(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            @click="deleteLesson(item)"
            color="error"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog dodawania/edycji zajęć -->
    <lesson-dialog
      v-model="showAddDialog"
      :lesson="editedLesson"
      @save="onLessonSaved"
      @close="closeDialog"
    />

    <!-- Dialog potwierdzenia usunięcia -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 pa-6 pb-4">Potwierdź usunięcie</v-card-title>
        <v-card-text>
          Czy na pewno chcesz usunąć zajęcia z przedmiotu {{ lessonToDelete?.subject?.name }}?
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
import { useLessonsStore } from '@/stores/lessons'
import { useGroupsStore } from '@/stores/groups'
import { useProgramsStore } from '@/stores/programs'
import { useSubjectsStore } from '@/stores/subjects'
import { useUsersStore } from '@/stores/users'
import { useRoomsStore } from '@/stores/rooms'
import LessonDialog from '@/components/schedule/LessonDialog.vue'

export default {
  name: 'Lessons',
  components: {
    LessonDialog
  },
  setup() {
    const lessonsStore = useLessonsStore()
    const groupsStore = useGroupsStore()
    const programsStore = useProgramsStore()
    const subjectsStore = useSubjectsStore()
    const usersStore = useUsersStore()
    const roomsStore = useRoomsStore()
    return { lessonsStore, groupsStore, programsStore, subjectsStore, usersStore, roomsStore }
  },
  data() {
    return {
      statusFilter: null,
      groupFilter: null,
      dateFrom: null,
      dateTo: null,
      showAddDialog: false,
      showDeleteDialog: false,
      editedLesson: null,
      lessonToDelete: null,
      lessonTypes: [
        { title: 'Wykład', value: 'lecture' },
        { title: 'Laboratorium', value: 'lab' },
        { title: 'Seminarium', value: 'seminar' },
        { title: 'Projekt', value: 'project' }
      ],
      headers: [
        { title: 'ID', key: 'id', width: '60px' },
        { title: 'Przedmiot', key: 'subject' },
        { title: 'Termin', key: 'schedule' },
        { title: 'Sala', key: 'room' },
        { title: 'Grupa', key: 'group' },
        { title: 'Wykładowca', key: 'lecturer' },
        { title: 'Status', key: 'status' },
        { title: 'Typ', key: 'lesson_type' },
        { title: 'Akcje', key: 'actions', sortable: false, width: '120px' }
      ]
    }
  },
  computed: {
    dateFromFormatted() {
      return this.dateFrom ? this.dateFrom.toLocaleDateString('pl-PL') : ''
    },
    dateToFormatted() {
      return this.dateTo ? this.dateTo.toLocaleDateString('pl-PL') : ''
    },
    filteredLessons() {
      let lessons = this.lessonsStore.lessons
      
      if (this.statusFilter) {
        lessons = lessons.filter(lesson => lesson.status === this.statusFilter)
      }
      
      if (this.groupFilter) {
        lessons = lessons.filter(lesson => lesson.group.id === this.groupFilter)
      }
      
      if (this.dateFrom) {
        lessons = lessons.filter(lesson => new Date(lesson.starts_at) >= this.dateFrom)
      }
      
      if (this.dateTo) {
        lessons = lessons.filter(lesson => new Date(lesson.starts_at) <= this.dateTo)
      }
      
      return lessons
    },
    statusOptions() {
      return [
        { title: 'Wszystkie', value: null },
        ...this.lessonsStore.lessonStatuses.map(status => ({
          title: status.label,
          value: status.value
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
    lecturers() {
      return this.usersStore.getUsersByRole('lecturer').map(user => ({
        id: user.id,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email
      }))
    },
    roomsWithLabels() {
      return this.roomsStore.rooms.map(room => ({
        id: room.id,
        number: room.number,
        building: room.building,
        capacity: room.capacity,
        roomLabel: `${room.building || 'N/A'}/${room.number || 'N/A'} (${room.capacity || 0} miejsc)`
      }))
    }
  },
  methods: {
    updateDateFrom() {
      // Date picker callback
    },
    updateDateTo() {
      // Date picker callback  
    },
    
    initNewLesson() {
      this.editedLesson = null
      this.showAddDialog = true
    },
    
    editLesson(lesson) {
      this.editedLesson = lesson
      this.showAddDialog = true
    },
    
    deleteLesson(lesson) {
      this.lessonToDelete = lesson
      this.showDeleteDialog = true
    },
    
    confirmDelete() {
      if (this.lessonToDelete) {
        this.lessonsStore.deleteLesson(this.lessonToDelete.id)
        this.showDeleteDialog = false
        this.lessonToDelete = null
      }
    },
    
    onLessonSaved() {
      this.lessonsStore.fetchLessons()
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.editedLesson = null
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
    
    getStatusColor(status) {
      switch (status) {
        case 'scheduled': return 'success'
        case 'rescheduled': return 'warning'
        case 'cancelled': return 'error'
        default: return 'grey'
      }
    },
    
    getStatusLabel(status) {
      const statusObj = this.lessonsStore.lessonStatuses.find(s => s.value === status)
      return statusObj ? statusObj.label : status
    },
    
    getTypeColor(type) {
      switch (type) {
        case 'lecture': return 'blue'
        case 'lab': return 'green'
        case 'seminar': return 'orange'
        case 'project': return 'purple'
        default: return 'grey'
      }
    },
    
    getTypeLabel(type) {
      const typeObj = this.lessonTypes.find(t => t.value === type)
      return typeObj ? typeObj.title : type
    }
  },
  mounted() {
    this.lessonsStore.fetchLessons()
    this.groupsStore.fetchGroups()
    this.programsStore.fetchPrograms()
    this.subjectsStore.fetchSubjects()
    this.usersStore.fetchUsers()
    this.roomsStore.fetchRooms()
  }
}
</script>
