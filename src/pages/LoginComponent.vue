<template>
  <div class="login-container">
    <div class="brand-section animated fadeInLeft">
      <div class="brand-content">
        <AllIcon
          name="CrmIcon"
          :size="180"
          color="white"
          class="logo-icon animated bounce delay-1s"
        />
        <h1 class="brand-title">Gérez vos projets et ressources en toute sécurité</h1>
        <p class="brand-subtitle">La solution tout-en-un pour une gestion optimale de vos activités</p>

        <div class="features-list">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-item animated fadeInLeft"
            :class="`delay-${index + 2}s`"
          >
            <q-icon :name="feature.icon" size="sm" />
            <span>{{ feature.text }}</span>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <q-btn
          flat
          label="En savoir plus"
          color="white"
          icon="info"
          class="animated fadeIn delay-6"
        />
      </div>
    </div>

    <!-- Divider animé -->
    <div class="divider-container">
      <div class="animated-divider"></div>
    </div>

    <div class="authentication form-section animated fadeInRight">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AllIcon from 'components/icons/AllIcon.vue'
import { ref } from 'vue'

const features = ref([
  { icon: 'task_alt', text: 'Gestion complète des projets' },
  { icon: 'groups', text: 'Collaboration en équipe' },
  { icon: 'security', text: 'Sécurité des données' },
  { icon: 'insights', text: 'Analyses et rapports' }
])
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 50%;
    bottom: 0;
    width: 100vw;
    background-image: url('../assets/background_image.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.9;
    z-index: 0;
  }
}

.brand-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  color: white;
  position: relative;
  z-index: 1;

  .brand-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 24px;
  }

  .logo-icon {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .brand-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    line-height: 1.2;
  }

  .brand-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    max-width: 80%;
  }

  .features-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
    width: 100%;
    max-width: 400px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(5px);
      }

      span {
        font-size: 1rem;
      }
    }
  }

  .brand-footer {
    display: flex;
    justify-content: center;
  }
}

.divider-container {
  position: relative;
  width: 2px;
  height: 100%;
  z-index: 2;

  .animated-divider {
    height: 60%;
    width: 100%;
    background: rgba(255, 255, 255, 0.3);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    animation: dividerGrow 1s ease-out forwards;
  }
}

.form-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  z-index: 1;
  background: white;
}

// Animations
@keyframes dividerGrow {
  from { height: 0 }
  to { height: 60% }
}

.animated {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeInLeft {
  animation-name: fadeInLeft;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.fadeInRight {
  animation-name: fadeInRight;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.bounce {
  animation-name: bounce;
}

// Responsive
@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;

    &::before {
      right: 0;
      width: 100%;
      height: 40%;
    }
  }

  .brand-section {
    padding: 20px;
    flex: none;
    height: 40vh;

    .brand-title {
      font-size: 1.8rem;
    }

    .brand-subtitle {
      font-size: 1rem;
    }
  }

  .divider-container {
    display: none;
  }

  .form-section {
    flex: none;
    height: 60vh;
    padding: 20px;
  }
}
</style>
