<template>
  <div class="register-container">
    <div class="register-form">
      <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
        <div class="text-h4 text-center q-mb-md">Créer un compte</div>

        <div class="row q-gutter-md">
          <q-input class="col" v-model="form.firstName" label="Prénom *" outlined :rules="[val => !!val || 'Champ obligatoire']" lazy-rules>
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input class="col" v-model="form.lastName" label="Nom *" outlined :rules="[val => !!val || 'Champ obligatoire']" lazy-rules>
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
        </div>

        <q-select v-model="form.gender" :options="genderOptions" label="Civilité *" outlined :rules="[val => !!val || 'Champ obligatoire']" emit-value map-options>
          <template v-slot:prepend>
            <q-icon name="wc" />
          </template>
        </q-select>

        <q-input v-model="form.email" label="Email *" type="email" outlined :rules="emailRules" lazy-rules>
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input v-model="form.password" label="Mot de passe *" :type="showPassword ? 'text' : 'password'" outlined :rules="passwordRules" lazy-rules>
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword"/>
          </template>
        </q-input>

        <q-input v-model="form.passwordConfirm" label="Confirmation mot de passe *" :type="showPassword ? 'text' : 'password'" outlined :rules="[
           val => !!val || 'Champ obligatoire',
           val => val === form.password || 'Les mots de passe ne correspondent pas'
         ]" lazy-rules>
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <q-checkbox v-model="form.termsAccepted" label="J'accepte les conditions d'utilisation" :rules="[val => !!val || 'Vous devez accepter les conditions']"/>

        <q-btn label="S'inscrire" type="submit" color="primary" :loading="loading" class="full-width">
          <template v-slot:loading>
            <q-spinner-hourglass class="on-left" />
            Enregistrement...
          </template>
        </q-btn>

        <div class="text-center q-mt-md">
          <p class="text-caption">
            Déjà un compte ?
            <q-btn label="Se connecter" flat dense color="primary" size="sm" @click="$router.push({ name: 'login' })"/>
          </p>
        </div>
      </q-form>
    </div>
    <ModalConfirmation v-model="showConfirmationModal" :email="this.form.email" @back-home="router.push({ name: 'login' })"/>
  </div>
</template>

<script>
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import {useSecurityStore} from 'src/modules/security/store/security.js'
import ModalConfirmation from "src/modules/security/ModalConfirmation.vue";

export default {
  name: 'RegisterPage',
  components: {ModalConfirmation},
  setup () {
    const securityStore = useSecurityStore()
    const $q = useQuasar()
    const router = useRouter()
    return { securityStore, $q, router }
  },
  data() {
    return {
      showConfirmationModal: false,
      form: {
        firstName: '',
        lastName: '',
        gender: 'M',
        email: '',
        password: '',
        passwordConfirm: '',
        termsAccepted: false
      },
      showPassword: false,
      loading: false,
      genderOptions: [
        { label: 'Masculin', value: 'M' },
        { label: 'Féminin', value: 'F' },
        { label: 'Autre', value: 'O' }
      ]
    }
  },

  computed: {
    emailRules() {
      return [
        val => !!val || 'Champ obligatoire',
        val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Email invalide'
      ]
    },
    passwordRules() {
      return [
        val => !!val || 'Champ obligatoire',
        val => val.length >= 6 || 'Minimum 6 caractères',
        val => /[A-Z]/.test(val) || 'Doit contenir une majuscule',
        val => /[0-9]/.test(val) || 'Doit contenir un chiffre'
      ]
    }
  },

  methods: {
     handleSubmit() {
      this.loading = true
       this.securityStore.register(this.form).then(() => {
         this.$q.notify({message: 'Inscription réussie !', color: 'positive', icon: 'check_circle'})
         this.showConfirmationModal = true
       }).catch((error) => {
         let message = "Erreur lors de l'inscription"
         if (error.response?.data?.message) {
           message = error.response.data.message
         }
         this.$q.notify({message, color: 'negative', icon: 'error'})
       }).finally(() => this.loading = false)
    }
  }
}
</script>

<style scoped lang="scss">
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../../assets/background_image.jpg');
  background-size: cover;
  background-position: center;
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .register-form {
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
