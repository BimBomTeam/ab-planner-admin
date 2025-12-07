<template>
  <div class="calendar-container">
    <!-- Header with dates -->
    <div class="calendar-header d-flex">
      <div style="width: 60px" class="time-col-header"></div>
      <div
        v-for="day in weekDays"
        :key="day.date"
        class="day-col-header flex-grow-1 text-center py-2 border-bottom border-left"
        :class="{ 'current-day': isToday(day.date) }"
      >
        <div class="font-weight-bold">{{ day.name }}</div>
        <div class="text-caption">{{ formatDate(day.date) }}</div>
      </div>
    </div>

    <!-- Body -->
    <div class="calendar-body position-relative" style="height: 600px; overflow-y: auto;">
      <!-- Time slots background -->
      <div v-for="hour in hours" :key="hour" class="d-flex" style="height: 60px;">
        <div class="time-label text-caption text-right pr-2 pt-1" style="width: 60px; border-right: 1px solid #eee;">
          {{ hour }}:00
        </div>
        <div 
            v-for="day in weekDays" 
            :key="day.date + hour"
            class="flex-grow-1 border-bottom border-right slot-cell"
            style="border-color: #f0f0f0 !important;"
            @click="onSlotClick(day.date, hour)"
        ></div>
      </div>

      <!-- Events Overlay -->
      <div class="events-overlay position-absolute top-0 left-0 w-100 h-100" style="pointer-events: none;">
        <div class="d-flex h-100 ml-15"> <!-- Margin left to skip time col -->
            <div v-for="day in weekDays" :key="'col-' + day.date" class="flex-grow-1 position-relative h-100">
                <div
                    v-for="lesson in getLessonsForDay(day.date)"
                    :key="lesson.id"
                    class="lesson-card position-absolute pa-1 rounded elevation-1"
                    :style="getLessonStyle(lesson)"
                    @click.stop="onLessonClick(lesson)"
                    style="pointer-events: auto; cursor: pointer; border-left: 4px solid;"
                    :class="getStatusColorClass(lesson.status)"
                >
                    <div class="text-caption font-weight-bold text-truncate">{{ lesson.subject.code }}</div>
                    <div class="text-caption text-truncate">{{ lesson.room.number }}</div>
                    <div class="text-caption text-truncate">{{ lesson.group.code }}</div>
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
    }
  },
  emits: ['edit-lesson', 'select-slot'],
  setup(props, { emit }) {
    const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00 - 21:00

    const weekDays = computed(() => {
      const curr = new Date() // get current date
      const first = curr.getDate() - curr.getDay() + 1 // First day is the day of the month - the day of the week
      
      const days = []
      for (let i = 0; i < 7; i++) {
        let next = new Date(curr.getTime())
        next.setDate(first + i)
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
        
        // 60px height per hour = 1px per date
        return {
            top: `${startOffsetMin}px`,
            height: `${durationMin}px`,
            width: '95%',
            left: '2.5%',
            zIndex: 10,
            backgroundColor: '#fff'
        }
    }

    const getStatusColorClass = (status) => {
        switch(status) {
            case 'scheduled': return 'border-left-primary bg-blue-lighten-5'
            case 'cancelled': return 'border-left-error bg-red-lighten-5'
            case 'rescheduled': return 'border-left-warning bg-orange-lighten-5'
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
.border-left { border-left: 1px solid #e0e0e0; }
.border-right { border-right: 1px solid #e0e0e0; }
.border-bottom { border-bottom: 1px solid #e0e0e0; }

.current-day {
  background-color: #e3f2fd;
}

.lesson-card {
  font-size: 0.75rem;
  line-height: 1.1;
  overflow: hidden;
  transition: transform 0.1s, box-shadow 0.1s;
}

.lesson-card:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
  z-index: 20 !important;
}

.border-left-primary { border-left-color: #1976D2 !important; }
.border-left-error { border-left-color: #FF5252 !important; }
.border-left-warning { border-left-color: #FB8C00 !important; }
.border-left-grey { border-left-color: #9E9E9E !important; }

.slot-cell:hover {
    background-color: #fafafa;
    cursor: pointer;
}
</style>
