<template>
  <q-page class="dashboard-page q-pa-md">
    <div v-if="isLoading" class="full-width flex flex-center">
      <q-spinner size="50px" color="primary" />
    </div>

    <div v-else>
      <div class="text-h4 text-primary text-weight-bold q-mb-lg">Tableau de bord</div>

      <!-- Statistiques -->
      <div class="row q-col-gutter-md q-mb-lg">
        <q-card
          v-for="stat in stats"
          :key="stat.title"
          class="col-12 col-sm-6 col-md-3 stats-card"
          :class="stat.color"
          flat
          bordered
          hoverable
        >
          <q-card-section>
            <div class="text-h6 text-white">{{ stat.title }}</div>
            <div class="text-h3 text-white">{{ stat.value }}</div>
          </q-card-section>
          <q-icon :name="stat.icon" class="stat-icon" />
        </q-card>
      </div>

      <!-- Projets + Graphiques -->
      <div class="row q-col-gutter-md">
        <!-- Table des projets -->
        <div class="col-12 col-md-6">
          <q-card class="fade-in">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Projets</div>
            </q-card-section>
            <q-card-section class="q-pt-none">
              <q-table
                :rows="projects"
                :columns="projectColumns"
                row-key="name"
                flat
                hide-pagination
                class="project-table"
              >
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge :color="getStatusColor(props.value)" class="q-pa-sm" rounded>
                      {{ displayNameStatus(props.value) }}
                    </q-badge>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Statistiques circulaires -->
        <div class="col-12 col-md-6">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-sm-6">
              <q-card class="fade-in">
                <q-card-section class="bg-info text-white">
                  <div class="text-h6">Projets en cours</div>
                </q-card-section>
                <q-card-section class="text-center">
                  <q-circular-progress
                    show-value
                    font-size="12px"
                    :value="currentProgressPercent"
                    size="100px"
                    :thickness="0.2"
                    color="info"
                    track-color="grey-3"
                    class="q-ma-md"
                  >
                    {{ currentProgressPercent }}%
                  </q-circular-progress>
                  <div class="text-subtitle1">Terminés: {{ doneProjects.length }}</div>
                  <div class="text-subtitle1">En cours: {{ currentProjects.length }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6">
              <q-card class="fade-in">
                <q-card-section class="bg-warning text-white">
                  <div class="text-h6">À faire</div>
                </q-card-section>
                <q-card-section class="text-center">
                  <q-circular-progress
                    show-value
                    font-size="12px"
                    :value="todoProgressPercent"
                    size="100px"
                    :thickness="0.2"
                    color="warning"
                    track-color="grey-3"
                    class="q-ma-md"
                  >
                    {{ todoProgressPercent }}%
                  </q-circular-progress>
                  <div class="text-subtitle1">Terminés: {{ doneProjects.length }}</div>
                  <div class="text-subtitle1">À faire: {{ todoProjects.length }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Utilisateurs -->
          <q-card class="fade-in">
            <q-card-section class="bg-teal text-white">
              <div class="text-h6">Utilisateurs</div>
            </q-card-section>
            <q-card-section>
              <q-list bordered separator>
                <q-item
                  v-for="user in users"
                  :key="user.email"
                  class="user-item"
                  v-ripple
                >
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      {{ user.lastName.charAt(0) }} {{ user.firstName.charAt(0) }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ user.lastName }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useProjectStore } from 'src/modules/Projects/store/projectStore.js'
import { useUserStore } from 'src/modules/Users/Store/UsersStore.js'

export default {
  setup () {
    const projectStore = useProjectStore()
      const usersStore = useUserStore()
    return {
      projectStore, usersStore
    }
  },
  data() {
    return {
      isLoading:  true,
      projectColumns: [
        { name: 'name', label: 'Projet', field: 'name', align: 'left' },
        { name: 'tasks', label: 'Tâches', field: 'tasks', align: 'center' },
        { name: 'status', label: 'Statut', field: 'status', align: 'center' }
      ],
      projects: [],
      users: []
    }
  },
  computed: {
    stats() {
      return [
        {
          title: 'Projets Totaux',
          value: this.projects?.length ?? 0,
          color: 'bg-blue',
          icon: 'folder'
        },
        {
          title: 'Tâches Totales',
          value: this.totalTasks, // Optionnel: déduit d'autres données
          color: 'bg-green',
          icon: 'list_alt'
        },
        {
          title: 'Tâches Terminées',
          value: this.completedTasks, // Optionnel aussi
          color: 'bg-teal',
          icon: 'check_circle'
        },
        {
          title: 'Utilisateurs',
          value: this.users?.length ?? 0,
          color: 'bg-purple',
          icon: 'people'
        }
      ];
    },

    totalTasks() {
      return this.projects.reduce((sum, project) => sum + (project.tasks || 0), 0);
    },
    completedTasks() {
      return this.projects.reduce((sum, project) => sum + (project.completedTasks || 0), 0);
    },
    totalProjects() {
      return this.projects?.length ?? 0;
    },

    doneProjects() {
      return this.projects.filter(p => p.status === 'done')
    },

    currentProjects() {
      return this.projects.filter(p => p.status === 'current')
    },

    todoProjects() {
      return this.projects.filter(p => p.status === 'todo')
    },

    currentProgressPercent() {
      return this.totalProjects
        ? Math.round((this.currentProjects.length / this.totalProjects) * 100)
        : 0
    },
    todoProgressPercent() {
      return this.totalProjects
        ? Math.round((this.todoProjects.length / this.totalProjects) * 100)
        : 0
    }
  },
  mounted() {
    this.isLoading = true
    this.initComponent()
  },
  methods: {
    initComponent () {
      this.projectStore.initProject().then(data => {
        this.projects = data.map(({ tasksNumber, ...rest }) => ({
          ...rest,
          tasks: tasksNumber
        }))
      }).catch(() => this.isLoading = true)

      this.usersStore.getUsers().then((data) => {
        this.users = data?.users
      }).catch(() => this.isLoading = true)

      this.isLoading = false
    },
    displayNameStatus(status) {
      switch (status) {
        case 'current': return 'En cours'
        case 'done': return 'Terminé'
        case 'todo': return 'À faire'
        default: return 'Inconnu'
      }
    },
    getStatusColor(status) {
      switch (status) {
        case 'done': return 'positive'
        case 'current': return 'info'
        case 'todo': return 'warning'
        default: return 'grey'
      }
    },
  }
}
</script>

<style scoped>

.dashboard-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.stats-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 3rem;
  opacity: 0.15;
  pointer-events: none;
}

.project-table:hover {
  opacity: 0.95;
}

.user-item:hover {
  background-color: #f0f7ff;
  transform: translateX(5px);
  transition: all 0.3s ease;
}

.fade-in {
  animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

</style>
