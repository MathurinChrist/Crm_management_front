<template>
  <div class="project-list-container q-pa-md column">

    <!-- Barre d'action : créer + rechercher -->
    <div class="button-search q-mb-md fadeIn">
      <q-btn label="Créer un projet" color="primary" icon="add" @click="openCreateDialog" class="pulse" no-caps />
      <q-input
        v-model="searchQuery"
        label="Rechercher un projet"
        debounce="300"
        clearable
        outlined
        dense
        standout
        bg-color="white"
        class="search-input fadeInRight"
        @keyup="filterProjects"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="full-height flex flex-center">
      <q-spinner-ios size="40px" color="primary" class="pulse infinite" />
    </div>

    <!-- Tableau des projets -->
    <q-table
      v-else
      flat
      bordered
      :rows="rows"
      :columns="columns"
      row-key="id"
      binary-state-sort
      class="project-table fadeInUp"
      :grid="$q.screen.lt.md"
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:top>
        <div class="text-h5 text-weight-bold text-primary">
          Tous les projets
          <q-badge color="primary" align="top" class="q-ml-sm">{{ rows.length }}</q-badge>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" @click="initProject">
          <q-tooltip>Actualiser la liste</q-tooltip>
        </q-btn>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props" class="project-row fadeIn delay-1s">
          <!-- Nom + statut -->
          <q-td key="name" @click="openProjectDetails(props.row)" class="cursor-pointer text-weight-bold">
            <div class="row items-center no-wrap">
              <q-icon
                :name="props.row.status === 'done' ? 'check_circle' : 'hourglass_empty'"
                :color="getStatusColor(props.row.status)"
                size="sm"
                class="q-mr-sm"
              />
              <span class="ellipsis">{{ props.row.name }}</span>
            </div>
          </q-td>

          <!-- Statut badge -->
          <q-td key="status">
            <q-chip
              dense
              square
              text-color="white"
              :color="getStatusColor(props.row.status)"
              :icon="props.row.status === 'done' ? 'check' : 'schedule'"
              :label="displayNameStatus(props.row.status)"
              class="zoomIn"
            />
          </q-td>

          <!-- Tâches -->
          <q-td key="tasksNumber">
            <q-linear-progress
              :value="props.row.tasksCompleted / props.row.tasksNumber"
              color="primary"
              rounded
              size="20px"
              class="q-mt-sm"
            >
              <div class="absolute-full flex flex-center text-white text-caption">
                {{ props.row.tasksCompleted }}/{{ props.row.tasksNumber }}
              </div>
            </q-linear-progress>
          </q-td>

          <!-- Description -->
          <q-td key="description">
            <q-btn flat dense icon="description" color="secondary" @click="toggleDescription(props.row)">
              <q-tooltip>Voir la description</q-tooltip>
            </q-btn>
            <q-dialog v-model="props.row.showDescription">
              <q-card class="description-card">
                <q-card-section class="bg-primary text-white">
                  <div class="text-h6">Description du projet</div>
                </q-card-section>
                <q-card-section>
                  {{ props.row.description || "Aucune description disponible." }}
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="Fermer" color="primary" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-td>

          <!-- Dates -->
          <q-td key="createdAt">
            <div class="text-center">
              {{ formatDate(props.row.createdAt) }}
              <q-icon name="event" size="xs" class="q-ml-xs">
                <q-tooltip>{{ new Date(props.row.createdAt).toLocaleTimeString() }}</q-tooltip>
              </q-icon>
            </div>
          </q-td>

          <q-td key="updatedAt">
            <div class="text-center">
              {{ formatDate(props.row.updatedAt) }}
              <q-icon name="update" size="xs" class="q-ml-xs">
                <q-tooltip>{{ new Date(props.row.updatedAt).toLocaleTimeString() }}</q-tooltip>
              </q-icon>
            </div>
          </q-td>

          <!-- Créé par -->
          <q-td key="createdBy">
            <div class="row items-center">
              <q-avatar size="sm" color="teal" text-color="white" class="q-mr-sm">
                {{ props.row.createdBy.firstName.charAt(0) }}{{ props.row.createdBy.lastName.charAt(0) }}
              </q-avatar>
              <span>{{ props.row.createdBy.firstName }} {{ props.row.createdBy.lastName }}</span>
            </div>
          </q-td>

          <!-- Modifié par -->
          <q-td key="updatedBy">
            <div class="row items-center">
              <q-avatar size="sm" color="orange" text-color="white" class="q-mr-sm">
                {{ props.row.updatedBy.firstName.charAt(0) }}{{ props.row.updatedBy.lastName.charAt(0) }}
              </q-avatar>
              <span>{{ props.row.updatedBy.firstName }} {{ props.row.updatedBy.lastName }}</span>
            </div>
          </q-td>

          <!-- Actions -->
          <q-td key="actions">
            <div class="actions-icons">
              <q-btn dense flat round icon="edit" color="primary" @click="openEditDialog(props.row)" />
              <q-btn dense flat round icon="delete" color="negative" @click="confirmDelete(props.row)" />
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- Aucune donnée -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-pa-lg">
          <q-icon name="search_off" size="2em" />
          <span>Aucun projet trouvé</span>
          <q-btn flat color="primary" label="Créer un projet" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <!-- Dialog Form -->
    <FormCreateOrUpdateProject ref="projectDialog" @project-updated="initProject" />
    <router-view />
  </div>
</template>

<script>
  import {useTaskStore} from 'src/modules/Tasks/Store/TaskStore.js'
  import {useProjectStore} from 'src/modules/Projects/store/projectStore.js'

  import FormCreateOrUpdateProject from 'src/modules/Projects/FormCreateOrUpdateProject.vue'
  import {useQuasar} from "quasar";

  export default {
    name: 'ProjectComponent',
    components: { FormCreateOrUpdateProject },
    setup () {
      const taskStore = useTaskStore()
      const projectStore = useProjectStore()
      return {
        taskStore, projectStore
      }
    },
    data () {
      return {
        $q: useQuasar(),
        rows: [],
        showDialog: false,
        searchQuery: null,
        loading: false
      }
    },
    computed: {
      columns () {
        return [
          { name: 'name', label: 'Nom du projet', field: 'name', align: 'left', sortable: true },
          { name: 'status', label: 'Statut', field: 'status', align: 'center', sortable: true },
          { name: 'tasksNumber', label: 'Tâches', field: 'tasksNumber', align: 'center', sortable: true },
          { name: 'description', label: 'Description', field: 'description', align: 'left' },
          { name: 'createdAt', label: 'Créé le', field: 'createdAt', align: 'center', sortable: true },
          { name: 'updatedAt', label: 'Mis à jour le', field: 'updatedAt', align: 'center', sortable: true },
          { name: 'createdBy', label: 'Créé par', field: row => `${row.createdBy.firstName} ${row.createdBy.lastName}`, align: 'left' },
          { name: 'updatedBy', label: 'Mis à jour par', field: row => `${row.updatedBy.firstName} ${row.updatedBy.lastName}`, align: 'left' },
          { name: 'actions', label: 'Actions', field: '', align: 'center' }
        ]
      }
    },
    mounted() {
      this.initProject()
    },
    methods: {
      initProject() {
        this.showDialog = false
        this.loading = true
        this.projectStore.setProjects().then(() => {
          this.loading = true
          this.rows = this.projectStore.getAllProjects().map(p => ({
            ...p,
            showDescription: false,
            tasksCompleted: p.tasksNumber
          }))
        }).finally(() => {
          this.loading = false
        })
      },
      openProjectDetails(project) {
        this.taskStore.getProjectTasks(project?.id).then((data) => {
          this.taskStore.setTasks(data.tasks ?? [])
        })
        this.projectStore.setCurrentProject(project)
        this.$router.push({ name: 'project-overview', params: { id: project.id } })
      },
      getStatusColor(status) {
        // const statusOptions = ['todo', 'done', 'current'];
        switch (status) {
          case 'current': return 'orange'
          case 'done': return 'green'
          default: return 'grey'
        }
      },
      displayNameStatus (status) {
        console.log('la valeur de status est', status)
        switch (status) {
          case 'current': return 'En cours'
          case 'done': return 'Terminé'
          case 'todo': return 'A faire'
          default: return 'En courssfsfsf'
        }
      },
      formatDate(date) {
        return new Date(date).toLocaleDateString()
      },
      toggleDescription(row) {
        row.showDescription = !row.showDescription
      },
      filterProjects() {
        const query = this.searchQuery.trim().toLowerCase()
        const allProjects = this.projectStore.getAllProjects()
        if (!query) {
          this.rows = allProjects
        } else {
          this.rows = allProjects.filter(project =>
            project.name.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query))
          )
        }
      },
      openCreateDialog() {
        this.$refs.projectDialog.openDialogForCreate()
      },
      openEditDialog(project) {
        this.$refs.projectDialog.openDialogForEdit(project)
      },
      confirmDelete(project) {
        this.$q.notify({
          title: 'Confirmation',
          message: `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`, color: 'negative', cancel: true, persistent: true, timeout: 0,
          actions: [{ label: 'Supprimer', color: 'white', handler: () => this.deleteProject(project.id)}]
        })
      },
      deleteProject(projectId) {
        this.projectStore.deleteProject(projectId).then(() => {
          this.$q.notify({message: 'Projet supprimé avec succès', color: 'positive', icon: 'check_circle', position: 'top-right'})
          this.initProject()
        }).catch(() => {
          this.$q.notify.notify({message: 'Erreur lors de la suppression', color: 'negative', icon: 'error', position: 'top-right'})
        })
  }


    }
  }
</script>

<style scoped lang="scss">
.project-list-container {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.button-search {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;

  .search-input {
    flex-grow: 1;
    max-width: 400px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}

.project-table {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
}

.project-row {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #eef7ff;
    .actions-icons {
      opacity: 1;
    }
  }
}

.actions-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;

  button {
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.description-card {
  max-width: 600px;
  width: 90vw;
  border-radius: 12px;
}

// Animations
.fadeIn { animation: fadeIn 0.5s ease; }
.fadeInRight { animation: fadeInRight 0.5s ease; }
.fadeInUp { animation: fadeInUp 0.5s ease; }
.zoomIn { animation: zoomIn 0.3s ease; }
.pulse { animation: pulse 1.5s infinite ease-in-out; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@media (max-width: 768px) {
  .button-search {
    flex-direction: column;
    align-items: stretch;

    .search-input {
      max-width: 100%;
    }
  }
}

</style>
