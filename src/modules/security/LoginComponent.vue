<template>
  <div class="login-form q-pa-lg">
    <q-form @submit.prevent="handleLogin" class="full-width">
      <div class="icons">
      </div>
      <q-input v-model="email" label="Adresse Email" type="email" outlined dense class="q-mb-md" :rules="[val => checkValue(val)]"/>
      <q-input v-model="password" label="Mot de passe" type="password" outlined dense class="q-mb-lg" :rules="[val => !!val || 'Champ requis']"/>

      <q-btn label="Connexion" @click="connect" color="primary" class="full-width" />
    </q-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
  if (!email.value || !password.value) return
  console.log('here')
}

const checkValue = function (val){
  if (val === '') {
    return 'dffdfdffdf'
  } else {
    return ''
  }
}

const connect = function () {
  let payload = { email: email.value, password: password.value }
  console.log('la payload est', payload)
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
