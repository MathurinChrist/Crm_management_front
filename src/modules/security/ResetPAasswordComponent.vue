<template>
  <div class="forgot-password-form">
    <h2>Mot de passe oublié ?</h2>
    <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

    <q-form @submit.prevent="submitEmail">
      <q-input v-model="email" label="Email" type="email" outlined dense :rules="[val => !!val || 'Email requis', val => /.+@.+\..+/.test(val) || 'Email invalide']"/>
      <div class="actions">
        <q-btn label="Envoyer" color="primary" type="submit" />
        <q-btn flat label="Retour" color="grey" @click="goBack" />
      </div>
    </q-form>

    <q-banner v-if="successMessage" class="bg-positive text-white q-mt-md">
      {{ successMessage }}
    </q-banner>

    <q-banner v-if="errorMessage" class="bg-negative text-white q-mt-md">
      {{ errorMessage }}
    </q-banner>
  </div>
</template>

<script>
import { useSecurityStore } from "src/modules/security/store/security.js";

export default {
  name: 'ForgotPasswordForm',
  setup () {
    const securityUser = useSecurityStore()
    return {
      securityUser
    }
  },

  data() {
    return {
      email: '',
      successMessage: '',
      errorMessage: ''
    }
  },

  methods: {
     submitEmail() {
     this.securityUser.changePassword({ email: this.email }).then(() => {
       this.successMessage = ''
         this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse email.'
       }).catch((err) => {
         this.errorMessage = err.response?.data?.message || "Erreur lors de l'envoi. Veuillez réessayer."
       })
    },

    goBack() {
      this.$router.push({name: 'login'})
    }
  }
}
</script>

<style scoped>
.forgot-password-form {
  max-width: 400px;
  margin: auto;
  text-align: center;

  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
}
</style>
