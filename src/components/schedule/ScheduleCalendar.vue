<template>
  <div class="calendar-container">
    <!-- Body with sticky header -->
    <div class="calendar-body position-relative" style="height: 600px; overflow: auto;">

      <!-- Content Wrapper -->
      <div class="calendar-content position-relative" style="min-width: 900px;">

        <!-- Sticky Header -->
        <div class="calendar-header d-flex position-sticky top-0 bg-surface" style="z-index: 100;">
          <div class="time-col-header border-right border-bottom bg-surface position-sticky left-0"
            style="min-width: 60px; max-width: 60px; z-index: 101;">
          </div>
          <div v-for="day in weekDays" :key="day.date"
            class="day-col-header text-center py-2 border-bottom border-right bg-surface"
            style="flex: 1 1 0; min-width: 120px;" :class="{ 'current-day': isToday(day.date) }">
            <div class="font-weight-bold">{{ day.name }}</div>
            <div class="text-caption">{{ formatDate(day.date) }}</div>
          </div>
        </div>

        <!-- Time slots background -->
        <div>
          <div v-for="hour in hours" :key="hour" class="d-flex" style="height: 60px;">
            <div class="time-label text-caption text-right pr-2 pt-1 position-sticky left-0 bg-surface"
              style="min-width: 60px; max-width: 60px; z-index: 99;">
              {{ hour }}:00
            </div>
            <div v-for="day in weekDays" :key="day.date + hour" class="border-bottom border-right slot-cell"
              style="flex: 1 1 0; min-width: 120px;" @click="onSlotClick(day.date, hour)"></div>
          </div>
        </div>

        <!-- Events Overlay -->
        <div class="events-overlay position-absolute top-0 left-0 w-100 h-100"
          style="pointer-events: none; padding-top: 55px;">
          <div class="d-flex h-100 w-100">
            <div style="min-width: 60px; max-width: 60px;"></div>
            <div v-for="day in weekDays" :key="'col-' + day.date" class="position-relative h-100"
              style="flex: 1 1 0; min-width: 120px;">
              <div v-for="lesson in getLessonsForDay(day.date)" :key="lesson.id"
                class="lesson-card position-absolute pa-1 rounded elevation-1" :style="getLessonStyle(lesson)"
                @click.stop="onLessonClick(lesson)" style="pointer-events: auto; cursor: pointer;">
                <div class="text-caption font-weight-bold text-truncate">{{ lesson.subject.code }}</div>
                <div class="text-caption text-truncate">{{ lesson.room.number }}</div>
                <div class="text-caption text-truncate">{{ lesson.group.code }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ScheduleCalendar',
  props: {
    lessons: {
      type: Array,
      default: () => []
    },
    currentDate: {
      type: [Date, String],
      default: () => new Date()
    }
  },
  emits: ['edit-lesson', 'select-slot'],
  setup(props, { emit }) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

    const weekDays = computed(() => {
      const curr = new Date(props.currentDate)
      const day = curr.getDay()
      const diff = curr.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
      const first = new Date(curr.setDate(diff))

      const days = []
      for (let i = 0; i < 7; i++) {
        let next = new Date(first)
        next.setDate(first.getDate() + i)
        days.push({
          date: next.toISOString().split('T')[0],
          name: next.toLocaleDateString('pl-PL', { weekday: 'long' })
        })
      }
      return days
    })

    const isToday = (dateStr) => {
      return dateStr === new Date().toISOString().split('T')[0]
    }

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('pl-PL', { day: 'numeric', month: 'numeric' })
    }

    const getLessonsForDay = (dateStr) => {
      return props.lessons.filter(l => l.starts_at.startsWith(dateStr))
    }

    const getLessonStyle = (lesson) => {
      const start = new Date(lesson.starts_at)
      const end = new Date(lesson.ends_at)

      const startHour = start.getHours()
      const startMin = start.getMinutes()
      const endHour = end.getHours()
      const endMin = end.getMinutes()

      // Calculate offset from 8:00
      const startOffsetMin = (startHour - 8) * 60 + startMin
      const durationMin = (endHour - 8) * 60 + endMin - startOffsetMin

      const typeConfig = {
        lecture: { bg: '#102035', border: '#2196F3' }, // Dark Blue background, Blue border
        lab: { bg: '#103015', border: '#4CAF50' },      // Dark Green background, Green border
        seminar: { bg: '#352010', border: '#FF9800' },  // Dark Orange/Brown background, Orange border
        project: { bg: '#251035', border: '#9C27B0' }   // Dark Purple background, Purple border
      }

      const config = typeConfig[lesson.lesson_type] || { bg: '#202020', border: '#9E9E9E' }

      return {
        top: `${startOffsetMin}px`,
        height: `${durationMin}px`,
        width: '95%',
        left: '2.5%',
        zIndex: 10,
        backgroundColor: config.bg,
        borderLeft: `4px solid ${config.border}`
      }
    }

    const getStatusColorClass = (status) => {
      switch (status) {
        case 'scheduled': return 'border-left-primary'
        case 'cancelled': return 'border-left-error'
        case 'rescheduled': return 'border-left-warning'
        default: return 'border-left-grey'
      }
    }

    const onLessonClick = (lesson) => {
      emit('edit-lesson', lesson)
    }

    const onSlotClick = (date, hour) => {
      // Create date object for the selected slot
      const d = new Date(date)
      d.setHours(hour, 0, 0, 0)
      emit('select-slot', d)
    }

    return {
      hours,
      weekDays,
      isToday,
      formatDate,
      getLessonsForDay,
      getLessonStyle,
      getStatusColorClass,
      onLessonClick,
      onSlotClick
    }
  }
}
</script>

<style scoped>
.border-left {
  border-left: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.border-right {
  border-right: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.current-day {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
}

.lesson-card {
  font-size: 0.75rem;
  line-height: 1.1;
  overflow: hidden;
  transition: transform 0.1s, box-shadow 0.1s;
  color: rgba(255, 255, 255, 0.87);
}

.lesson-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
  z-index: 20 !important;
}

.border-left-primary {
  border-left-color: #64B5F6 !important;
  background-color: #1a232c !important;
  /* Solid dark blue-grey */
}

.border-left-error {
  border-left-color: #E57373 !important;
  background-color: #2c1a1a !important;
  /* Solid dark red-grey */
}

.border-left-warning {
  border-left-color: #FFB74D !important;
  background-color: #2c251a !important;
  /* Solid dark orange-grey */
}

.border-left-grey {
  border-left-color: #90A4AE !important;
  background-color: #262626 !important;
  /* Solid dark grey */
}

.slot-cell {
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.slot-cell:hover {
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.time-label {
  color: rgba(255, 255, 255, 0.6);
  border-right: 1px solid rgba(255, 255, 255, 0.12) !important;
}
</style>
