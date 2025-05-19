import { defineStore, acceptHMRUpdate } from 'pinia'
import { axiosInstance } from 'boot/axios.js'
import { ref } from 'vue'

export const useSecurityStore = defineStore('security', () => {
  const currentUser = ref(null)

  function login(payload) {
    return axiosInstance.post('/login_check', payload).then(res => res.data)
  }

  function getMe() {
    return axiosInstance.get('/user/me').then(res => res.data)
  }

  function setToken(token) {
    localStorage.setItem('token', token)
  }

  function getToken() {
    return localStorage.getItem('token')
  }

  function setCurrentUser(user) {
    currentUser.value = user
  }

  return {
    login,
    getMe,
    setToken,
    getToken,
    setCurrentUser,
    currentUser
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSecurityStore, import.meta.hot))
}
