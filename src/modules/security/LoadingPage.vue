<template>
  <div  class="full-width flex flex-center">
    <q-spinner size="50px" color="primary" />
  </div>
</template>

<script>
import { useSecurityStore } from 'src/modules/security/store/security.js'

export default {
  name: 'LoadingPage',
  setup () {
    const securityStore = useSecurityStore()
    return {
      securityStore
    }
  },
  data () {
    return {}
  },
  mounted() {
    const holdToken = localStorage.getItem('token') ?? null
    if (holdToken) {
      localStorage.removeItem(holdToken)
    }
    const token = this.$route.query?.token
    setTimeout(() => {
      if (!token) {
        this.$router.push('login')
      }
      localStorage.setItem('token', token)

      this.securityStore.getMe().then(response => {
        this.securityStore.setCurrentUser(response.user)
        this.$router.push({ name: 'dashboard' })
        this.$q.notify({message: 'Connexion réussie', color: 'positive', icon: 'check_circle', position: 'top'})
      }).catch((error) => {
        this.$q.notify({message: error?.message ?? 'Erreur de onnexion' , color: 'negative', icon: 'check_circle', position: 'top'})
      })
    }, 1000)
  }
}
</script>

<style scoped>
div {
  background: transparent;
}
</style>
