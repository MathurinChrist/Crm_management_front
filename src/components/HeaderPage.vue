<template>
  <q-header elevated class="header bg-primary text-white">
    <q-toolbar class="q-py-sm">
      <!-- Logo avec animation -->
      <div class="logo-container animated fadeIn">
        <AllIcon name="CrmIcon" :size="40" color="white" class="logo-icon" />
        <span class="logo-text text-h5 text-weight-bold q-ml-sm">CRM Pro</span>
      </div>

      <q-space />

      <div class="row items-center q-gutter-sm">
        <q-btn
          flat
          round
          dense
          icon="notifications"
          class="animated fadeIn delay-1"
        >
          <q-badge floating color="red" rounded />
          <q-tooltip>Notifications</q-tooltip>
        </q-btn>

        <q-btn
          flat
          round
          dense
          icon="email"
          class="animated fadeIn delay-2"
        >
          <q-badge floating color="orange" rounded />
          <q-tooltip>Messages</q-tooltip>
        </q-btn>

        <q-separator vertical spaced inset />

        <q-btn-dropdown
          flat
          stretch
          :label="userName"
          class="animated fadeIn delay-3 user-menu"
        >
          <q-list>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name="account_circle" />
              </q-item-section>
              <q-item-section>Profil</q-item-section>
            </q-item>

            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Paramètres</q-item-section>
            </q-item>

            <q-separator />

            <q-item clickable v-close-popup @click.stop="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Déconnexion</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </q-toolbar>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="white"
      track-color="transparent"
      class="progress-bar"
    />
  </q-header>
</template>

<script>
import AllIcon from "components/icons/AllIcon.vue"
import {useSecurityStore} from "src/modules/security/store/security.js";

export default {
  name: 'HeaderPage',
  components: { AllIcon },
  setup ()  {
    const userStore = useSecurityStore()
    return {
      userStore
    }
  },
  data () {
    return {
       username : 'John Doe',
       loading  : false
    }
  },
  methods: {
    logout () {
      localStorage.removeItem('token')
      this.$router.push({name: 'login'})
    }
  }
}
</script>

<style scoped lang="scss">
.header {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  .logo-container {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
      transform: scale(1.02);
    }

    .logo-icon {
      transition: all 0.3s ease;
    }

    .logo-text {
      letter-spacing: 1px;
    }
  }

  .user-menu {
    :deep(.q-btn__content) {
      display: flex;
      align-items: center;

      .q-icon {
        margin-right: 8px;
      }
    }
  }

  .progress-bar {
    height: 2px;
  }
}

// Animations
.animated {
  animation-duration: 0.5s;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fadeIn {
  animation-name: fadeIn;
}

@media (max-width: 600px) {
  .logo-text {
    display: none;
  }
}
</style>
