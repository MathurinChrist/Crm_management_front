<template>
  <div>
    <CircularPending/>
  </div>
</template>

<script>
import { setCompanyToken } from 'src/helpers/storage'

import { useSsoStore } from 'src/modules/sso/stores/sso'
import { useUserStore } from 'src/modules/user/stores/user'

import CircularPending from 'layouts/CircularPending.vue'

export default {
  name: 'SsoLogin',
  components: { CircularPending },
  setup () {
    const ssoStore = useSsoStore()
    const userStore = useUserStore()
    return {
      ssoStore,
      userStore
    }
  },
  mounted () {
    const token = this.$route.query.token ?? ''
    if (token !== '') {
      this.ssoStore.login({ token: token })
      this.userStore.getMe().then((data) => {
        setCompanyToken(data.user.company.guid)
        this.$router.push({ name: 'items', params: { folderGuid: 'root' }, query: { page: 1, size: 20 } })
      })
    } else {
      this.ssoStore.setErrorMessage(this.$t('page_login.error_sso'))
      this.$router.push({ name: 'auth/login' })
    }
  }
}
</script>
<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
  .icon {
    height: 100px;
    width: 240px;
  }

  .pending-bar {
    width: 400px;
    height: 4px;
    background-color: #f3f3f3;
    position: relative;
    overflow: hidden;
    margin: 20px 0;
  }
}
</style>
