import {acceptHMRUpdate, defineStore} from 'pinia'
import {axiosInstance} from 'boot/axios.js'

import {ref} from 'vue'

export const useProjectStore = defineStore('project', () => {
  const projects = ref([])
  const currentProject = ref(null)
  const CurrentProjectTasksNumber = ref(0)

  async function initProject() {
    try {
      const response = await axiosInstance.get('/project/allProject')
      return response.data.data
    } catch (error) {
      console.error('Erreur est', error)
    }
  }

  async function setProjects() {
    try {
      projects.value = await initProject()
    } catch (error) {
      console.error('Erreur est', error)
    }
  }

  function setCurrentProject (project) {
    currentProject.value = project
    setCurrentProjectTasksNumber(project?.tasksNumber)
  }

  function setCurrentProjectTasksNumber (tasksCounters) {
    CurrentProjectTasksNumber.value = tasksCounters
  }

  function getAllProjects() {
    return projects.value
  }

  function getCurrentProject () {
    return currentProject.value ?? null
  }

  function createProject (payload) {
    return new Promise((resolve, reject) => {
      axiosInstance.post('/project/create', payload)
        .then((response) => resolve(response?.data))
        .catch(error => reject(error))
    })
  }

  function updateProject (payload) {
    return new Promise((resolve, reject) => {
      axiosInstance.put('/project/'+ payload.id, payload)
        .then((response) => resolve(response?.data))
        .catch(error => reject(error))
    })
  }

  function deleteProject (projectId) {
    return new Promise((resolve, reject) => {
      axiosInstance.delete('/project/delete/'+ projectId)
        .then((response) => resolve(response?.data))
        .catch(error => reject(error))
    })
  }

  function getProjectTAskCounters () {
    return CurrentProjectTasksNumber.value
  }

  return {
    CurrentProjectTasksNumber,
    currentProject,
    getCurrentProject,
    getProjectTAskCounters,
    setCurrentProject,
    setCurrentProjectTasksNumber,
    initProject,
    projects,
    deleteProject,
    createProject,
    updateProject,
    setProjects,
    getAllProjects
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot))
}
