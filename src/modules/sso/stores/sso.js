import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'boot/axios'

import { ref } from 'vue'

import * as storage from 'src/helpers/storage'

export const useSsoStore = defineStore('sso', () => {
  const errorMessage = ref('')

  function clearDataOutOutdated () {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith('dataOut_')) {
        const data = JSON.parse(localStorage.getItem(key))
        const differenceInHours = (new Date() - new Date(data?.savedAt)) / (1000 * 60 * 60)
        if (differenceInHours > 48) {
          localStorage.removeItem(key)
        }
      }
    }
  }

  function login (data) {
    clearDataOutOutdated()
    if (data !== undefined) {
      storage.setAccessTokens(data.token, data.refresh_token)
    }
  }

  function connectToProvider (provider) {
    return new Promise((resolve, reject) => {
      api.get('/auth/' + provider).then(({ data }) => {
        resolve(data)
      }).catch((error) => {
        reject(error)
      })
    })
  }

  function setErrorMessage (message) {
    errorMessage.value = message
  }

  function clearErrorMessage () {
    errorMessage.value = ''
  }

  function getErrorMessage () {
    return errorMessage.value
  }

  return {
    login,
    connectToProvider,
    errorMessage,
    setErrorMessage,
    clearErrorMessage,
    getErrorMessage
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSsoStore, import.meta.hot))
}
