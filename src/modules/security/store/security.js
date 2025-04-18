import { defineStore, acceptHMRUpdate } from 'pinia'
import { axiosInstance } from 'boot/axios.js'

export const useSecurityStore = defineStore('security', () => {
    function login(payload) {
        return new Promise((resolve, reject) => {
            axiosInstance.post('/login_check', payload)
                .then((response) => resolve(response?.data))
                .catch(error => reject(error))
        })
    }

    return { login }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useSecurityStore, import.meta.hot))
}
