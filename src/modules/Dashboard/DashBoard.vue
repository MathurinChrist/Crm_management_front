<template>
  <q-page class="q-pa-md dashboard-page">
    <div class="text-h4 q-mb-md text-weight-bold text-primary">Dashboard</div>

    <div class="row q-col-gutter-md q-mb-md">
      <q-card class="col-md-3 col-sm-6 col-xs-12 stats-card" v-for="stat in stats" :key="stat.title"
              :class="stat.color" animated hoverable>
        <q-card-section>
          <div class="text-h6 text-white">{{ stat.title }}</div>
          <div class="text-h3 text-white">{{ stat.value }}</div>
        </q-card-section>
        <q-icon :name="stat.icon" class="stat-icon" />
      </q-card>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-md-6 col-xs-12">
        <q-card class="animated fadeInLeft delay-1">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Projects</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-table
              flat
              :rows="projects"
              :columns="projectColumns"
              row-key="name"
              hide-pagination
              class="project-table"
            >
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="getStatusColor(props.value)" class="q-pa-sm" rounded>
                    {{ props.value }}
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-md-6 col-xs-12">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-md-6 col-xs-12">
            <q-card class="animated fadeInRight delay-1 progress-card">
              <q-card-section class="bg-info text-white">
                <div class="text-h6">Projets en cours</div>
              </q-card-section>
              <q-card-section class="text-center">
                <q-circular-progress
                  show-value
                  font-size="12px"
                  :value="60"
                  size="100px"
                  :thickness="0.2"
                  color="info"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  60%
                </q-circular-progress>
                <div class="text-subtitle1">Terminés: 15</div>
                <div class="text-subtitle1">En cours: 10</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-md-6 col-xs-12">
            <q-card class="animated fadeInRight delay-2 hold-card">
              <q-card-section class="bg-warning text-white">
                <div class="text-h6">En attente</div>
              </q-card-section>
              <q-card-section class="text-center">
                <q-circular-progress
                  show-value
                  font-size="12px"
                  :value="25"
                  size="100px"
                  :thickness="0.2"
                  color="warning"
                  track-color="grey-3"
                  class="q-ma-md"
                >
                  25%
                </q-circular-progress>
                <div class="text-subtitle1">Completed: 5</div>
                <div class="text-subtitle1">Pending: 15</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="animated fadeInUp delay-3">
          <q-card-section class="bg-teal text-white">
            <div class="text-h6">Utilisateurs</div>
          </q-card-section>
          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="user in users" :key="user.email" class="user-item" v-ripple>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ user.name.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption>{{ user.email }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="email" color="grey" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      stats: [
        { title: 'Projets Totaux', value: 12, color: 'bg-blue', icon: 'folder' },
        { title: 'Tâches Totales', value: 25, color: 'bg-green', icon: 'list_alt' },
        { title: 'Tâches Terminées', value: 8, color: 'bg-teal', icon: 'check_circle' },
        { title: 'Utilisateurs', value: 5, color: 'bg-purple', icon: 'people' }
      ],
      projectColumns: [
        { name: 'name', label: 'Projet', field: 'name', align: 'left' },
        { name: 'tasks', label: 'Tâches', field: 'tasks', align: 'center' },
        { name: 'status', label: 'Statut', field: 'status', align: 'center' }
      ],
      projects: [
        { name: 'Website Redesign', tasks: '2 / 3', status: 'In Progress' },
        { name: 'Mobile App', tasks: '4 / 4', status: 'Completed' },
        { name: 'SEO Optimization', tasks: '1 / 4', status: 'In Progress' },
        { name: 'Marketing Campaign', tasks: '0 / 3', status: 'On Hold' }
      ],
      users: [
        { name: 'Albert Dupont', email: 'Albert.dupont@exmie.com' },
        { name: 'Marie Bertrand', email: 'marie.bertrand@exmie.com' },
        { name: 'Jean Lefevre', email: 'jean.lefevre@example.com' },
        { name: 'Sophie Marchand', email: 'sophie.marchard@exmie.com' },
        { name: 'Louis Dubois', email: 'louis.dubois@example.com' }
      ]
    }
  },
  methods: {
    getStatusColor(status) {
      switch(status) {
        case 'Completed': return 'positive';
        case 'In Progress': return 'info';
        case 'On Hold': return 'warning';
        default: return 'grey';
      }
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  background-color: #f5f7fa;
}

.text-h3 {
  font-size: 2.5rem;
}

.stats-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.stat-icon {
  position: absolute;
  right: 20px;
  top: 20px;
  font-size: 3rem;
  opacity: 0.2;
  transition: all 0.3s ease;
}

.stats-card:hover .stat-icon {
  opacity: 0.4;
  transform: scale(1.1);
}

.project-table {
  transition: opacity 0.5s ease;
}

.project-table:hover {
  opacity: 0.9;
}

.user-item {
  transition: all 0.3s ease;
}

.user-item:hover {
  background-color: #f0f7ff;
  transform: translateX(5px);
}

.progress-card, .hold-card {
  transition: all 0.4s ease;
}

.progress-card:hover, .hold-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* Animations */
.animated {
  animation-duration: 0.5s;
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

.delay-3 {
  animation-delay: 0.3s;
}
</style>
