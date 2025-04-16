<template>
  <div class="container login-content">
    <div class="society-information">
      <AllIcon name="CrmIcon" :size="150" color="white"/>
      <h1> Gerer vos projets et ressource en toute sécurité</h1>
    </div>
    <div class="divider"></div>
    <router-view />
  </div>
</template>

<script setup>
import AllIcon from 'components/icons/AllIcon.vue';
</script>

<style scoped>

.login-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  height: 100vh;
  background-image: url('../assets/background_image.jpg');
  background-size: cover;
  background-position: center;
}

.society-information {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap:1px;
  justify-content: space-between;

    h1 {
      font-size: 2.5rem;
      color: white;
      text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
      font-weight: bold;
    }

  span {
    color: white;
    font-size: 16px;
  }
}

.divider {
  width: 2px;
  height: 60%;
  background-color: #ccc;
}
</style>
