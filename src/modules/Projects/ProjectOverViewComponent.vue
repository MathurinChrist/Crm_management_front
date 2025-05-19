<template>
  <q-page v-if="showPage" class="q-pa-md q-gutter-y-md bg-grey-1">
    <q-card class="project-header-card shadow-5 animated fadeInDown">
      <q-card-section class="row items-center justify-between">
        <div class="col-grow">
          <div class="text-h4 text-weight-bold text-white">{{ project.name }}</div>
          <div class="text-subtitle1 text-grey-3 q-mt-sm">{{ project.description || "Aucune description" }}</div>
        </div>
        <q-badge :color="statusColor(project.status)" class="status-badge text-subtitle1 q-px-md q-py-sm" rounded>
          <q-icon :name="statusIcon(project.status)" class="q-mr-xs" />
          {{ project.status }}
        </q-badge>
      </q-card-section>
      <q-linear-progress :value="progressValue" color="white" track-color="white" class="progress-bar"/>
    </q-card>
    <div class="row q-col-gutter-md">
      <div v-for="(info, index) in projectInfos" :key="index" class="col-12 col-md-3" :class="`animated fadeInUp delay-${index + 1}`">
        <q-card class="info-card" bordered>
          <q-card-section class="row items-center">
            <q-avatar :color="info.color" text-color="white" :icon="info.icon" size="lg" class="q-mr-md"/>
            <div>
              <div class="text-subtitle2 text-grey-7">{{ info.label }}</div>
              <div class="text-h6 text-weight-bold">{{ info.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="tasks-section-card shadow-3 animated fadeIn delay-4">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h5 text-weight-bold">Tâches du projet</div>
          <q-btn label="Ajouter une tâche" color="primary" icon="add" @click="addTask" class="animated pulse delay-5s"/>
        </div>

        <q-tabs v-model="taskTab" inline-label class="text-teal q-mt-md" active-color="primary" indicator-color="primary">
          <q-tab name="all" icon="list_alt" label="Toutes" />
          <q-tab name="todo" icon="schedule" label="À faire" />
          <q-tab name="inProgress" icon="hourglass_empty" label="En cours" />
          <q-tab name="done" icon="check_circle" label="Terminées" />
        </q-tabs>
        <q-separator class="q-mb-md" />

        <div v-if="tasksLoading" class="full-height flex flex-center q-pa-xl">
          <q-spinner-ios color="primary" size="3em" class="animated pulse infinite" />
        </div>

        <q-list v-else separator class="animated fadeIn">
          <q-item v-for="task in filteredTasks" :key="task.id" class="task-item q-my-sm"
                  :class="`task-status-${task.status.toLowerCase().replace(' ', '-')}`" clickable v-ripple @click="openTaskDetails(task)"
                  @mouseover="hoveredTaskId = task.id"
                  @mouseleave="hoveredTaskId = null">
            <q-item-section avatar>
              <q-avatar :color="taskAvatarColor(task)" text-color="white" :icon="taskStatusIcon(task.status)"/>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-bold">{{ task.title }}</q-item-label>
              <q-item-label caption lines="2">
                <span class="text-grey-7">Créée le {{ formatDate(task.createdAt) }}</span> •
                <span class="text-grey-7">Assignée à {{ formatUser(task.assignedTo || task.createdBy) }}</span>
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row items-center">
                <q-badge :color="taskStatusColor(task.status)" class="q-mr-sm" rounded> {{ task.status }}</q-badge>
                <q-btn v-show="hoveredTaskId === task.id" flat round dense icon="delete" color="negative" @click.stop="confirmDeletingTask(task)"/>
              </div>
            </q-item-section>
          </q-item>

          <q-item v-if="filteredTasks.length === 0" class="text-grey-7">
            <q-item-section class="text-center">
              <q-icon name="search_off" size="2em" class="q-mb-sm" />
              <div>Aucune tâche trouvée</div>
            </q-item-section>
          </q-item>
        </q-list>

        <q-pagination
          v-if="filteredTasks.length > 0"
          v-model="currentPage"
          :max="totalPages"
          :input="true"
          color="primary"
          class="q-mt-md justify-center"
        />
      </q-card-section>
    </q-card>

    <ViewTaskComponent />
    <TaskCreationComponent @task-created="refreshTasks" />
    <DeletePopup  @confirm-deleting = deleteTask() @cancel-deleting = cancelDeletingTask() v-model="taskDeleting"/>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        class="animated bounce delay-6s"
        @click="addTask"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import {date, useQuasar} from 'quasar'
import { useProjectStore } from 'src/modules/Projects/store/projectStore.js'
import { useTaskStore } from 'src/modules/Tasks/Store/TaskStore.js'
import ViewTaskComponent from 'src/modules/Tasks/Components/ViewTaskComponent.vue'
import TaskCreationComponent from 'src/modules/Tasks/Components/TaskCreationComponent.vue'
import DeletePopup from 'components/DeletePopupComponent.vue'

export default {
  components: {
    DeletePopup,
    TaskCreationComponent,
    ViewTaskComponent
  },
  setup() {
    const projectStore = useProjectStore()
    const taskStore = useTaskStore()
    const quasar = useQuasar()

    return {
      quasar,
      taskStore,
      projectStore
    }
  },
  data() {
    return {
      taskDeleting: null,
      taskToDelete: null,
      hoveredTaskId: false,
      tasksLoading: true,
      project: null,
      showPage: false,
      taskTab: 'all',
      currentPage: 1,
      rowsPerPage: 5
    }
  },
  computed: {
    projectInfos() {
      return [
        {
          label: 'Date de création',
          value: this.formatDate(this.project.createdAt),
          icon: 'event',
          color: 'blue'
        },
        {
          label: 'Tâches totales',
          value: this.project.tasksNumber || 0,
          icon: 'layers',
          color: 'teal'
        },
        {
          label: 'Créé par',
          value: this.formatUser(this.project.createdBy),
          icon: 'person',
          color: 'orange'
        },
        {
          label: 'Dernière mise à jour',
          value: this.formatDate(this.project.updatedAt),
          icon: 'update',
          color: 'purple'
        }
      ]
    },
    tasks() {
      return this.taskStore.getTasks().map(task => ({
        ...task,
        isHovered: task.id === this.hoveredTaskId
      }))
    },
    filteredTasks() {
      if (this.taskTab === 'all') return this.tasks
      return this.tasks.filter(task =>
        this.taskTab === 'todo' ? task.status === 'À faire' :
          this.taskTab === 'inProgress' ? task.status === 'En cours' :
            task.status === 'Terminé'
      )
    },
    totalPages() {
      return Math.ceil(this.filteredTasks.length / this.rowsPerPage)
    },
    progressValue() {
      if (!this.project.tasksNumber) return 0
      const completed = this.tasks.filter(t => t.status === 'Terminé').length
      return completed / this.project.tasksNumber
    }
  },
  methods: {
    refreshTasks() {
      this.tasksLoading = true
      this.taskStore.getProjectTasks(this.project?.id).then(data => {
        this.taskStore.setTasks(data.tasks ?? [])
      }).finally(() => {
        this.tasksLoading = false
      })
    },
    addTask() {
      this.$emitter.emit('open:dialog', { name: 'taskDialog' })
    },
    formatDate(d) {
      return date.formatDate(d, 'DD MMMM YYYY')
    },
    formatUser(u) {
      return u ? `${u.firstName} ${u.lastName}` : 'Non assigné'
    },
    openTaskDetails(task) {
      this.taskStore.setCurrentTask(task)
      this.$emitter.emit('open:task', task)
    },
    statusColor(status) {
      switch (status) {
        case 'Terminé': return 'positive'
        case 'En cours': return 'primary'
        case 'À faire': return 'grey'
        default: return 'dark'
      }
    },
    statusIcon(status) {
      switch (status) {
        case 'Terminé': return 'check_circle'
        case 'En cours': return 'hourglass_empty'
        case 'À faire': return 'schedule'
        default: return 'help'
      }
    },
    taskStatusColor(status) {
      return this.statusColor(status)
    },
    taskStatusIcon(status) {
      return this.statusIcon(status)
    },
    taskAvatarColor(task) {
      switch(task.status) {
        case 'Terminé': return 'green'
        case 'En cours': return 'blue'
        default: return 'grey'
      }
    },
    confirmDeletingTask (task) {
      this.taskDeleting = true
      this.taskToDelete = task
    },
    deleteTask() {
      if (!this.taskToDelete) return
      this.tasksLoading = true
      this.taskStore.deleteTask(this.taskToDelete).then(() => {
        this.refreshTasks()
        this.taskDeleting = false
        this.taskToDelete = null
        this.quasar.notify({message: 'Tâche supprimée avec succès', color: 'positive', icon: 'check_circle', position: 'top-right'})
      }).catch(e => {
        this.quasar.notify({message: e.data.message, color: 'nagative', icon: 'check_circle', position: 'top-right'})
      }).finally(() => {
        this.tasksLoading = false
        this.taskDeleting = false
        this.taskToDelete = null
      })
    },
    cancelDeletingTask () {
      this.taskDeleting = false
      this.taskToDelete = null
    }
  },
  mounted() {
    this.project = this.projectStore.getCurrentProject()
    if (this.project?.id) {
      this.showPage = true
      this.refreshTasks()
    }
  }
}
</script>

<style scoped lang="scss">
.project-header-card {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .status-badge {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .progress-bar {
    height: 4px;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
}

.info-card {
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.tasks-section-card {
  border-radius: 12px;
  margin-top: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
  }
}

.task-item {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e3f2fd !important;
    transform: translateX(5px);
  }

  &.task-status-terminé {
    border-left: 4px solid #4caf50;
  }

  &.task-status-en-cours {
    border-left: 4px solid #2196f3;
  }

  &.task-status-à-faire {
    border-left: 4px solid #9e9e9e;
  }
}

// Animations
.animated {
  animation-duration: 0.5s;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fadeIn {
  animation-name: fadeIn;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeInUp {
  animation-name: fadeInUp;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
}

.bounce {
  animation-name: bounce;
}

@media (max-width: 768px) {
  .project-header-card {
    .text-h4 {
      font-size: 1.5rem;
    }
  }

  .info-card {
    margin-bottom: 10px;
  }
}
</style>
