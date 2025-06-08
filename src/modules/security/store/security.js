import { defineStore, acceptHMRUpdate } from 'pinia'
import { axiosInstance } from 'boot/axios.js'
import { ref } from 'vue'

export const useSecurityStore = defineStore('security', () => {
  const currentUser = ref(null)

  function login(payload) {
    return axiosInstance.post('/login_check', payload).then(res => res.data)
  }

  function logout () {
    return new Promise((resolve, reject) => {
      return axiosInstance.post('/logout').then(() => resolve())
        .catch((error) => reject(error))
    })
  }

  function getMe() {
    return axiosInstance.get('/user/me').then(res => res.data)
  }

  function register (payload) {
    return new Promise((resolve, reject) => {
       axiosInstance.post('/user/admin/signIn', payload).then((data) => {
         return resolve(data)
       }).catch(data => {
         return reject(data)
       })
    })
  }

  function setToken(token) {
    localStorage.setItem('token', token)
  }

  function getToken() {
    return localStorage.getItem('token')
  }

  function getCurrentUser () {
    return currentUser.value
  }

  function setCurrentUser(user) {
    currentUser.value = user
  }

  return {
    logout,
    register,
    login,
    getMe,
    setToken,
    getToken,
    setCurrentUser,
    currentUser,
    getCurrentUser
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSecurityStore, import.meta.hot))
}
