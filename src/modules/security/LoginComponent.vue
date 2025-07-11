<template>
  <div class="login-form">
    <q-form @submit.prevent="login" class="q-gutter-md">
      <div class="text-h5 text-center q-mb-md"> Se connecter</div>
      <q-input v-model="email" ref="refEmail" label="Adresse Email *" type="email" outlined :rules="emailRules(email)" lazy-rules class="animated fadeInUp">
        <template v-slot:prepend>
          <q-icon name="email" />
        </template>
      </q-input>

      <q-input v-model="password" label="Mot de passe *" :type="showPassword ? 'text' : 'password'" outlined :rules="passwordRules" lazy-rules class="animated fadeInUp delay-1">
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword"/>
        </template>
      </q-input>

      <div class="row justify-between items-center">
        <q-checkbox v-model="rememberMe" label="Se souvenir de moi" dense />
        <q-btn label="Mot de passe oublié ?" flat dense color="primary" size="sm" @click="$router.push({ name: 'password-reset' })"/>
      </div>

      <q-btn label="Connexion" type="submit" color="primary" :loading="isLoading" class="full-width animated fadeInUp delay-2">
        <template v-slot:loading>
          <q-spinner-hourglass class="on-left" />
          Connexion...
        </template>
      </q-btn>

      <div class="text-center q-mt-md">
        <p class="text-caption">
          Pas encore de compte ?
          <q-btn label="Créer un compte" flat dense color="primary" size="sm" @click="$router.push({ name: 'register' })"/>
        </p>
      </div>
      <ConnectWith :options="optionConnect" />
    </q-form>
  </div>
</template>

<script>
import ConnectWith from '../sso/components/ConnectWith.vue'

import { useSecurityStore } from "src/modules/security/store/security.js";
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/modules/Users/Store/UsersStore.js'

export default {
  name: 'LoginComponent',
  components: {
    ConnectWith
  },
  setup () {
    const securityStore = useSecurityStore()
    const userStore = useUserStore()
    return {
      securityStore,
      userStore
    }
  },
  data () {
    return {
      $q: useQuasar(),
      email: null,
      password: null,
      showPassword: false,
      rememberMe: false,
      isLoading: false,
      refEmail: null
    }
  },
  computed: {
    optionConnect () {
      return [
        { name: 'MicroSoftIcon', provider: 'azure' },
        { name: 'GoogleIcon', provider: 'google'}
      ]
    }
  },
  mounted() {
    this.$refs.refEmail.focus()
  },
  methods: {
    login() {
      if (!this.email || !this.password) return
      this.isLoading = true
      const payload = {
        username: this.email,
        password: this.password,
        remember: this.rememberMe
      }
      this.securityStore.login(payload).then(response => {
        this.securityStore.setToken(response.token)
        this.securityStore.getMe().then(response => {
          this.securityStore.setCurrentUser(response.user)
        })
        this.userStore.getUsers().then( (response) => {
          this.userStore.users = response?.users
        })
        this.$router.push({ name: 'dashboard' })
        this.$q.notify({message: 'Connexion réussie', color: 'positive', icon: 'check_circle', position: 'top'})
      }).catch((error) => {
        this.$q.notify({message: error.response?.data?.message || 'Échec de la connexion', color: 'negative', icon: 'error', position: 'top'})
      }).finally(() => {
        this.isLoading = false
      })
    },
    emailRules (val) {
      if (!val) {
        return 'Champ obligatoire'
      }
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        return 'Email invalide'
      }
    },
    passwordRules (val) {
      if (!val) {
        return 'Champ obligatoire'
      }
      if (val && val.length >= 6) {
        return 'Email invalide'
      }
    },
  }
}
</script>

<style scoped lang="scss">
.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

// Animations
.animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeInUp {
  animation-name: fadeInUp;
}

@media (max-width: 600px) {
  .login-form {
    padding: 24px;
    box-shadow: none;
  }
}
</style>
