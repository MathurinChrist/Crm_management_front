import {acceptHMRUpdate, defineStore} from 'pinia'
import {axiosInstance} from 'boot/axios.js'

import {ref} from 'vue'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref([])

  function getTaskComment (taskId) {
    return new Promise((resolve, reject) => {
      axiosInstance.get('/comments/all/'+taskId)
        .then( data => resolve(data.data))
        .catch(error => reject(error))
    })
  }

  function addCommentOnTAsk (payload) {
    if (!payload?.taskId) return null
    return new Promise((resolve, reject) => {
      axiosInstance.post('/comments/addCommentOnTask/' + payload.taskId, payload)
        .then( (data) => {
          resolve(data.data)
        })
        .catch(error => reject(error))
    })
  }

  function getAllTAskComments () {
    return comments.value
  }


  return {
    getAllTAskComments,
    addCommentOnTAsk,
    getTaskComment,
    comments
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCommentStore, import.meta.hot))
}
