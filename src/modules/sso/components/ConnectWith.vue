<template>
  <div class="sso-container">
    <h2 class="sso-title">
      <span class="line"></span>
      <span class="connect_with bold primary">CONNECTER AVEC </span>
      <span class="line"></span>
    </h2>
    <div class="order-icon-sso">
      <div class="icons">
        <div class="icon">
          <GoogleIcon :size="24" @click.stop="connectWith('google')"/>
        </div>
        <div class="icon">
          <MicrosoftIcon :size="24" @click.stop="connectWith('azure')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MicrosoftIcon from 'components/icons/MicrosoftIcon.vue'
import GoogleIcon from 'components/icons/GoogleIcon.vue'

export default {
  name: 'ConnectWith',
  components: {
    GoogleIcon,
    MicrosoftIcon
  },
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  computed: {
    urlProviderConnection () {
      return 'http: www.google.com/' + 'auth/'
    }
  },
  methods: {
    connectWith (arg) {
      console.log('le arg est',  arg)
    },
    ssoLogin (provider) {
      window.location.href = this.urlProviderConnection + provider
    }
  }
}
</script>

<style scoped lang="scss">

.sso-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 20px;
}

.sso-title {
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 15px;
}

.sso-title .line {
  flex-grow: 1;
  height: 1px;
  background-color: #ccc;
}

.connect_with {
  margin-top: -5px;
  color: #1d1d1d;
  font-weight: bold;
}

.order-icon-sso {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.icons {
  display: flex;
  gap: 20px;
}

.icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ccc;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out, border-color 0.3s ease-in-out, background-color 0.3s ease-in-out;
  background-color: white;

  &:hover {
    transform: scale(1.1);
    border-color: #888;
    background-color: #f9f9f9;
  }
}

.icon svg {
  width: 24px;
  height: 24px;
}
</style>
