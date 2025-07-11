import { boot } from 'quasar/wrappers'
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: process.env.APP_BASE_URL,
    timeout: 5000,
    headers: {
      'Content-Type': 'application/json',
       Accept: 'application/json'
    }
})


axiosInstance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
}, error => {
    return Promise.reject(error)
})

axiosInstance.interceptors.response.use(response => {
    return response
}, error => {
    return Promise.reject(error)
})

export { axios, axiosInstance }

export default boot(({ app }) => {
    app.config.globalProperties.$axios = axios
    app.config.globalProperties.$axiosInstance = axiosInstance
})
