<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :width="240"
    :breakpoint="500"
    bordered
    :class="`sidebar ${$q.dark.isActive ? 'bg-dark' : 'bg-white'}`"
  >
    <q-scroll-area class="fit">
      <div class="sidebar-header q-pa-sm flex items-center">
        <q-icon name="menu" size="sm" class="q-mr-sm" />
        <div class="text-h6 text-weight-bold">Navigation</div>
      </div>

      <q-separator />

      <q-list class="menu-list">
        <template v-for="(menuItem, index) in menuList" :key="index">
          <q-item
            clickable
            :active="menuItem.name === currentPath"
            v-ripple
            @click="goToMenuItem(menuItem)"
            class="menu-item animated fadeIn"
            :class="`delay-${index % 5 * 0.1}s`"
            active-class="active-menu-item"
          >
            <q-item-section avatar>
              <q-icon
                :name="menuItem.icon"
                :color="menuItem.name === currentPath ? 'primary' : ''"
                size="sm"
              />
            </q-item-section>
            <q-item-section>
              <div class="text-subtitle1">{{ menuItem.label }}</div>
            </q-item-section>
            <q-item-section side v-if="menuItem.name === currentPath">
              <q-icon name="chevron_right" size="xs" />
            </q-item-section>
          </q-item>

          <q-separator
            v-if="menuItem.separator"
            :key="'sep' + index"
            class="separator animated fadeIn"
            :class="`delay-${index % 5 * 0.1 + 0.1}s`"
          />
        </template>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SideBar',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const drawer = ref(false)
    const menuList = ref([
      {
        icon: 'dashboard',
        label: 'Tableau de bord',
        name: 'dashboard',
        separator: true
      },
      {
        icon: 'folder',
        label: 'Projets',
        name: 'projects',
        separator: true
      },
      {
        icon: 'task_alt',
        label: 'Tâches',
        name: 'tasks_all',
        separator: false
      },
      {
        icon: 'email',
        label: 'Messagerie',
        name: 'communication',
        separator: false
      },
      {
        icon: 'people',
        label: 'Utilisateurs',
        name: 'users',
        separator: false
      },
      {
        icon: 'settings',
        label: 'Paramètres',
        name: 'settings',
        separator: false
      }
    ])

    const currentPath = computed(() => route.name)

    const goToMenuItem = (menuItem) => {
      router.push({ name: menuItem.name })
    }

    return {
      drawer,
      menuList,
      currentPath,
      goToMenuItem
    }
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  transition: all 0.3s ease;

  .sidebar-header {
    height: 60px;
    transition: all 0.3s ease;
  }

  .menu-list {
    padding: 8px 0;
  }

  .menu-item {
    margin: 4px 8px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      transform: translateX(5px);
    }

    &.active-menu-item {
      background-color: rgba(25, 118, 210, 0.1);
      color: var(--q-primary);
      font-weight: 500;
    }
  }

  .separator {
    margin: 8px 16px;
    opacity: 0.5;
  }
}

// Dark mode styles
.body--dark {
  .sidebar {
    .menu-item {
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      &.active-menu-item {
        background-color: rgba(25, 118, 210, 0.2);
      }
    }
  }
}

// Animations
.animated {
  animation-duration: 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.fadeIn {
  animation-name: fadeIn;
}

@media (max-width: 500px) {
  .sidebar {
    width: 180px !important;

    .menu-item {
      padding: 8px 12px;

      .q-item__section--side {
        padding-right: 0;
      }
    }
  }
}
</style>
