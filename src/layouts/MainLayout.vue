<template>
  <div class="q-pa-md">
    <q-layout view="hHh Lpr lff" container class="full-page shadow-2">
      <HeaderPage @display="showUserProfile"/>
      <SideBar :drawer="drawer" />
      <q-page-container>
        <q-page padding>
          <router-view />
        </q-page>
      </q-page-container>
    </q-layout>

    <UserProfileCard @close-card="showProfileCard = false" :data="data" :showProfile="showProfileCard" />
  </div>
</template>

<script>
  import SideBar from 'components/SideBar.vue'
  import HeaderPage from 'components/HeaderPage.vue'
  import UserProfileCard from 'src/modules/Users/Components/UserProfilComponent.vue'

  export  default {
    name: 'MainLayout',
    components: { UserProfileCard, SideBar, HeaderPage },
    data(){
      return {
        drawer: false,
        showProfileCard: false
      }
    },
    methods: {
    }
  }
</script>
<style>
.full-page {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
