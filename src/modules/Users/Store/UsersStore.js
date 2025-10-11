import {acceptHMRUpdate, defineStore} from 'pinia'

import {axiosInstance} from 'boot/axios.js'
import {ref} from 'vue'


export const useUserStore = defineStore('User', () => {
const users = ref([])
  function getUsers () {
    return new Promise((resolve, reject) => {
      axiosInstance.get('/users/all').then((response) => {
        return resolve(response.data)
      }).catch(error => reject(error))
    })
  }

  // function setUsers (data) {
  //   if (data?.length === 0) return
  //   users.value = data
  // }

  function update (currentUser) {
    if (!currentUser.id) return

    return new Promise((resolve, reject) => {
      console.log('je suisrentré dans la promesse')
      axiosInstance.put('/user/update/'+ currentUser?.id, currentUser).then((response) => {
        console.log('la response est', response)
         return resolve(response)
      }).catch(error => reject(error))
    })
  }

  function deleteUser (userId) {
    if (!userId) return
    return new Promise((resolve, reject) => {
      axiosInstance.delete('/user/admin/delete/'+ userId).then(() => {
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  }

  function createUser (user) {
    return new Promise((resolve, reject) => {
      axiosInstance.post('/user/create', user).then((data) => {
        resolve(data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  return {
    createUser,
    deleteUser,
    getUsers,
    update,
    users
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
