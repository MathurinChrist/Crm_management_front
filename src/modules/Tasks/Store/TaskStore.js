import {acceptHMRUpdate, defineStore} from 'pinia'

import {ref} from 'vue'
import {axiosInstance} from 'boot/axios.js'

export const useTaskStore = defineStore('projectTask', () => {
  const projectTasks = ref([])
  const currentTask = ref(null)

  function getTasks () {
    return projectTasks.value
  }

  function getCurrentTask () {
    return currentTask.value
  }
  function setCurrentTask (task) {
    currentTask.value = task
  }

  function setTasks (tasks) {
    projectTasks.value = tasks
  }

  function getProjectTasks (projectId) {
    if (!projectId ) return
    return new Promise((resolve, reject) => {
      axiosInstance.get('/task/'+projectId+'/allTask')
        .then( response =>  resolve(response.data) )
        .catch(error => reject(error))
    })
  }

  function createTask (payload) {
    console.log('la payload est', payload)
    const projectId = parseInt(payload?.project)
    return new Promise((resolve, reject) => {
      axiosInstance.post('/task/'+ projectId +'/create', payload)
        .then((response) => resolve(response?.data))
        .catch(error => reject(error))
    })
  }

  function deleteTask (task) {
    const projectId = parseInt(getProjectIdFromTask(task))
    return new Promise((resolve, reject) => {
      axiosInstance.delete('/task/'+ projectId +'/delete/'+ task.id)
        .then((response) => resolve(response?.data))
        .catch(error => reject(error))
    })
  }

  function getProjectIdFromTask (task) {
    return task.project?.id
  }

  return {
    deleteTask,
    projectTasks,
    currentTask,
    getProjectTasks,
    setCurrentTask,
    getCurrentTask,
    getTasks,
    createTask,
    setTasks
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTaskStore, import.meta.hot))
}
