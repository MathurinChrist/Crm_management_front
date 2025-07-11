<template>
  <div class="flex column q-pa-md project-list-container">
    <div class="button-search q-mb-md animated fadeIn">
      <q-btn label="Créer un projet" color="primary" icon="add" @click="openCreateDialog" class="animated pulse delay-2s" no-caps/>
      <q-input v-model="searchQuery" label="Rechercher un projet" debounce="150" icon="search" @keyup="filterProjects" standout bg-color="white" class="search-input animated fadeInRight"/>
    </div>

    <div v-if="loading" class="full-height flex flex-center">
      <q-spinner-ios size="40px" color="primary" class="animated pulse infinite"/>
    </div>

    <q-table v-else flat bordered title="Tous les projets" :rows="rows" :columns="columns" row-key="id" binary-state-sort class="project-table animated fadeInUp" :grid="$q.screen.lt.md" :pagination="{ rowsPerPage: 10 }">
      <template v-slot:top>
        <div class="text-h5 text-weight-bold text-primary q-py-sm">
          Tous les projets
          <q-badge color="primary" align="top">{{ rows.length }}</q-badge>
        </div>
        <q-space />
        <q-btn flat round dense icon="refresh" @click="initProject" class="q-mr-sm">
          <q-tooltip>Actualiser</q-tooltip>
        </q-btn>
      </template>

      <template v-slot:body="props">
        <q-tr
          :props="props"
          class="project-row animated fadeIn"
          :class="`delay-${props.rowIndex % 5 * 0.1}s`"
        >
          <q-td
            key="name"
            @click="openProjectDetails(props.row)"
            :props="props"
            class="cursor-pointer text-weight-bold"
          >
            <div class="row items-center no-wrap">
              <q-icon
                :name="props.row.status === 'done' ? 'task_alt' : 'hourglass_empty'"
                :color="getStatusColor(props.row.status)"
                size="sm"
                class="q-mr-sm"
              />
              <span class="ellipsis">{{ props.row.name }}</span>
            </div>
            <q-tooltip v-if="props.row.status === 'todo'" anchor="bottom middle" self="top middle">
              Projet en cours
            </q-tooltip>
          </q-td>

          <q-td key="status" :props="props">
            <q-chip
              :color="getStatusColor(props.row.status)"
              text-color="white"
              :icon="props.row.status === 'done' ? 'check' : 'schedule'"
              :label="displayNameStatus(props.row.status)"
              class="q-mb-xs animated zoomIn"
            />
          </q-td>

          <q-td key="tasksNumber" :props="props">
            <q-linear-progress
              :value="props.row.tasksCompleted / props.row.tasksNumber"
              size="20px"
              :color="props.row.tasksCompleted === props.row.tasksNumber ? 'positive' : 'primary'"
              rounded
              class="q-mt-sm"
            >
              <div class="absolute-full flex flex-center">
                <span class="text-white text-caption">{{ props.row.tasksCompleted }}/{{ props.row.tasksNumber }}</span>
              </div>
            </q-linear-progress>
          </q-td>

          <q-td key="description" :props="props">
            <q-btn
              flat
              label="Voir description"
              @click="toggleDescription(props.row)"
              color="secondary"
              icon="description"
              dense
              class="animated fadeIn"
            />
            <q-dialog v-model="props.row.showDescription">
              <q-card class="description-card">
                <q-card-section class="bg-primary text-white">
                  <div class="text-h6">Description du projet</div>
                </q-card-section>
                <q-card-section>
                  {{ props.row.description || "Aucune description disponible" }}
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat label="Fermer" color="primary" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-td>

          <q-td key="createdAt" :props="props">
            <div class="column items-center">
              <div>{{ formatDate(props.row.createdAt) }}</div>
              <q-icon name="schedule" size="xs" class="q-mt-xs">
                <q-tooltip>{{ new Date(props.row.createdAt).toLocaleTimeString() }}</q-tooltip>
              </q-icon>
            </div>
          </q-td>

          <q-td key="updatedAt" :props="props">
            <div class="column items-center">
              <div>{{ formatDate(props.row.updatedAt) }}</div>
              <q-icon name="schedule" size="xs" class="q-mt-xs">
                <q-tooltip>{{ new Date(props.row.updatedAt).toLocaleTimeString() }}</q-tooltip>
              </q-icon>
            </div>
          </q-td>

          <q-td key="createdBy" :props="props">
            <div class="row items-center">
              <q-avatar size="sm" color="teal" text-color="white" class="q-mr-sm">
                {{ props.row.createdBy?.firstName.charAt(0) }}{{ props.row.createdBy.lastName.charAt(0) }}
                {{ (props.row.createdBy?.firstName ?? props.row.firstName)?.charAt(0) }}
                {{ (props.row.createdBy?.lastName ?? props.row.lastName)?.charAt(0) }}
              </q-avatar>
              <span>{{ props.row.createdBy?.firstName ?? props.row.firstName  }} {{ props.row.lastName }}</span>
            </div>
          </q-td>

          <q-td key="updatedBy" :props="props">
            <div class="row items-center">
              <q-avatar size="sm" color="orange" text-color="white" class="q-mr-sm">
                {{ props.row.updatedBy.firstName.charAt(0) }}{{ props.row.updatedBy.lastName.charAt(0) }}
              </q-avatar>
              <span>{{ props.row.updatedBy.firstName }} {{ props.row.updatedBy.lastName }}</span>
            </div>
          </q-td>

          <q-td key="actions" :props="props">
            <div class="actions-icons">
              <q-btn dense flat round icon="edit" color="primary" @click="openEditDialog(props.row)" class="animated zoomIn"/>
              <q-btn dense flat round icon="delete" color="negative" @click="confirmDelete(props.row)" class="animated zoomIn"/>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm">
          <q-icon name="search_off" size="2em" />
          <span>Aucun projet trouvé</span>
          <q-btn flat color="primary" label="Créer un projet" @click="openCreateDialog" />
        </div>
      </template>
    </q-table>

    <FormCreateOrUpdateProject ref="projectDialog" @project-updated="initProject"/>
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
}

.button-search {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

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
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

.project-row {
  transition: all 0.3s ease;

  &:hover {
    background-color: #f0f7ff !important;
    transform: translateX(3px);

    .actions-icons {
      display: flex;
    }
  }
}

.actions-icons {
  display: none;
  justify-content: center;
  gap: 8px;

  button {
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }
}

.description-card {
  width: 80%;
  max-width: 600px;
  border-radius: 12px;
}

// Animations
.animated {
  animation-duration: 0.5s;
}

.delay-1s { animation-delay: 0.1s; }
.delay-2s { animation-delay: 0.2s; }
.delay-3s { animation-delay: 0.3s; }
.delay-4s { animation-delay: 0.4s; }

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

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.zoomIn {
  animation-name: zoomIn;
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
