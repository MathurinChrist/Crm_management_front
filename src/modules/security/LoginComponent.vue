<template>
  <div class="login-form q-pa-lg">
    <q-form  class="full-width">
      <div class="icons">
      </div>
      <q-input v-model="email" ref="refEmail" label="Adresse Email" type="email" outlined dense class="q-mb-md" :rules="[val => validateFieldValue(val)]"/>
      <q-input v-model="password" label="Mot de passe" type="password" outlined dense class="q-mb-lg" :rules="[val => !!val || 'Champ requis']"/>

      <q-btn label="Connexion" :loading="isLoading" @click="login" color="primary" class="full-width" />
    </q-form>
  </div>
</template>

<script setup>
    import { ref, onMounted} from 'vue';
    import { useRouter } from 'vue-router'

    import { useSecurityStore } from '../../modules/security/store/security.js'

    const security = useSecurityStore()
    const router = useRouter()

    const email = ref('')
    const refEmail = ref(null)
    const password = ref('')
    const isLoading = ref(false)

    onMounted(() => {
      refEmail.value?.focus()
    })

    const login = () => {
      isLoading.value = true
      let payload = {username: email.value, password: password.value}
      security.login(payload)
          .then((response) => {
            security.setToken(response.token)
            router.push({ name: 'projects' })
          })
          .catch(error => console.log(error))
        .finally(() => {
          isLoading.value = false
        })
    }

    const validateFieldValue = (val) => {
      if (!val) {
        return 'Champ requis'
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (refEmail.value.type ==='email' && !emailRegex.test(val)) {
        return 'Adresse email invalide'
      }
      return true
    }


</script>

<style scoped>

.login-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
  border-radius: 16px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: 30%;
  margin: 0 20px;
}
</style>
