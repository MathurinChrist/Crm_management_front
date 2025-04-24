<template>
  <q-drawer
    v-model="drawer"
    show-if-above
    :width="200"
    :breakpoint="500"
    :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'"
  >
    <q-scroll-area class="fit">
      <q-list>
        <template v-for="(menuItem, index) in menuList" :key="index">
          <q-item clickable :active="menuItem.name === currentPath" v-ripple @click="goToMenuItem(menuItem)">
            <q-item-section avatar>
              <AllIcon :name="menuItem.icon" />
            </q-item-section>
            <q-item-section>
              {{ menuItem.label }}
            </q-item-section>
          </q-item>
          <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
        </template>

      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script >
import { useRoute } from 'vue-router'
import AllIcon from 'components/icons/AllIcon.vue'
export default {
  name: 'SideBar',
  components: {AllIcon},
  props: {
  },
  setup(){
    const router = useRoute()
    return {router
    }
  },
  data(){
    return {
      drawer: false,
      menuList: [
        {
          icon: 'DashboardIcon',
          label: 'DashBoard',
          name: 'dashboard',
          separator: true
        },
        {
          icon: 'inbox',
          label: 'Les projets',
          name: 'projects',
          separator: true
        },
        {
          icon: 'send',
          label: 'Les tâches',
          name: 'tasks',
          separator: false
        },
        {
          icon: 'delete',
          label: 'Les utilisateurs',
          name: 'users',
          separator: false
        },
        {
          icon: 'error',
          label: 'Les groupes',
          name: 'groups',
          separator: true
        },
        {
          icon: 'settings',
          label: 'Settings',
          name: 'Settings',
          separator: false
        },
        {
          icon: 'feedback',
          label: 'Messageries',
          path: 'messages',
          separator: false
        },
        {
          icon: 'help',
          iconColor: 'primary',
          label: 'Help',
          path: 'help',
          separator: false
        }
      ],
      pathName: null
    }
  },

  computed: {
    currentPath () {
      return this.pathName
    }
  },
  methods: {
    init () {
      this.pathName = 'dashboard'
    },
    goToMenuItem(menuItem) {
     this.$router.push({ name: menuItem.name })
    }
  },
  watch: {
    '$route.name'(newPathName) {
      if (newPathName) {
        this.pathName = newPathName
      }
    }
  },
  mounted() {
    this.init()
    this.goToMenuItem('dashboard')
  }
}

</script>
