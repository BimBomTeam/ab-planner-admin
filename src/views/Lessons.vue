<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">Zajęcia</h1>
      <v-btn color="primary" @click="showAddDialog = true">
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
    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-card-title class="pa-6 pb-4">
          <span class="text-h5">{{ editedLesson.id ? 'Edytuj' : 'Dodaj' }} zajęcia</span>
        </v-card-title>
        
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedLesson.subject"
                  :items="programsStore.subjects"
                  item-title="name"
                  item-value="id"
                  label="Przedmiot"
                  variant="outlined"
                  required
                  return-object
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="editedLesson.group"
                  :items="groupsStore.groups"
                  item-title="code"
                  item-value="id"
                  label="Grupa"
                  variant="outlined"
                  required
                  return-object
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="formatDateTimeDisplay(editedLesson.starts_at)"
                      label="Początek zajęć"
                      variant="outlined"
                      required
                      prepend-inner-icon="mdi-calendar-clock"
                      readonly
                    ></v-text-field>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-date-picker
                        v-model="editedLessonStartDate"
                        locale="pl"
                        show-adjacent-months
                      ></v-date-picker>
                      <v-time-picker
                        v-model="editedLessonStartTime"
                        format="24hr"
                        class="mt-4"
                      ></v-time-picker>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn @click="updateStartDateTime">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-bind="props"
                      :model-value="formatDateTimeDisplay(editedLesson.ends_at)"
                      label="Koniec zajęć"
                      variant="outlined"
                      required
                      prepend-inner-icon="mdi-calendar-clock"
                      readonly
                    ></v-text-field>
                  </template>
                  <v-card>
                    <v-card-text>
                      <v-date-picker
                        v-model="editedLessonEndDate"
                        locale="pl"
                        show-adjacent-months
                      ></v-date-picker>
                      <v-time-picker
                        v-model="editedLessonEndTime"
                        format="24hr"
                        class="mt-4"
                      ></v-time-picker>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn @click="updateEndDateTime">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="editedLesson.lesson_type"
                  :items="lessonTypes"
                  label="Typ zajęć"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="editedLesson.status"
                  :items="lessonsStore.lessonStatuses"
                  item-title="label"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-select
                  v-model="editedLesson.room"
                  :items="roomsWithLabels"
                  item-title="roomLabel"
                  item-value="id"
                  label="Sala"
                  variant="outlined"
                  required
                  return-object
                ></v-select>
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="editedLesson.lecturer"
                  :items="lecturers"
                  item-title="name"
                  item-value="id"
                  label="Wykładowca"
                  variant="outlined"
                  required
                  return-object
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog">Anuluj</v-btn>
          <v-btn color="primary" @click="saveLesson">Zapisz</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useUsersStore } from '@/stores/users'

export default {
  name: 'Lessons',
  setup() {
    const lessonsStore = useLessonsStore()
    const groupsStore = useGroupsStore()
    const programsStore = useProgramsStore()
    const usersStore = useUsersStore()
    return { lessonsStore, groupsStore, programsStore, usersStore }
  },
  data() {
    return {
      statusFilter: null,
      groupFilter: null,
      dateFrom: null,
      dateTo: null,
      showAddDialog: false,
      showDeleteDialog: false,
      editedLesson: {},
      lessonToDelete: null,
      editedLessonStartDate: null,
      editedLessonStartTime: null,
      editedLessonEndDate: null,
      editedLessonEndTime: null,
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
      return this.usersStore.getUsersByRole('teacher').map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email
      }))
    },
    roomsWithLabels() {
      return this.lessonsStore.rooms.map(room => ({
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
    formatDateTimeDisplay(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      return date.toLocaleString('pl-PL', {
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    updateStartDateTime() {
      if (this.editedLessonStartDate && this.editedLessonStartTime) {
        const date = new Date(this.editedLessonStartDate)
        const [hours, minutes] = this.editedLessonStartTime.split(':')
        date.setHours(parseInt(hours), parseInt(minutes))
        this.editedLesson.starts_at = date.toISOString()
      }
    },
    updateEndDateTime() {
      if (this.editedLessonEndDate && this.editedLessonEndTime) {
        const date = new Date(this.editedLessonEndDate)
        const [hours, minutes] = this.editedLessonEndTime.split(':')
        date.setHours(parseInt(hours), parseInt(minutes))
        this.editedLesson.ends_at = date.toISOString()
      }
    },
    editLesson(lesson) {
      this.editedLesson = { ...lesson }
      // Setup date/time pickers
      if (lesson.starts_at) {
        const startDate = new Date(lesson.starts_at)
        this.editedLessonStartDate = startDate
        this.editedLessonStartTime = startDate.toTimeString().slice(0, 5)
      }
      if (lesson.ends_at) {
        const endDate = new Date(lesson.ends_at)
        this.editedLessonEndDate = endDate
        this.editedLessonEndTime = endDate.toTimeString().slice(0, 5)
      }
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
    
    saveLesson() {
      // Use the already converted ISO strings
      const lessonData = { ...this.editedLesson }
      
      if (this.editedLesson.id) {
        this.lessonsStore.updateLesson(this.editedLesson.id, lessonData)
      } else {
        this.lessonsStore.addLesson(lessonData)
      }
      this.closeDialog()
    },
    
    closeDialog() {
      this.showAddDialog = false
      this.editedLesson = {}
      this.editedLessonStartDate = null
      this.editedLessonStartTime = null
      this.editedLessonEndDate = null
      this.editedLessonEndTime = null
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
    
    formatDateTimeLocal(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
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
  }
}
</script>