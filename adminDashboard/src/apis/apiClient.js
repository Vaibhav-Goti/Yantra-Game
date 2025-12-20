const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
import axios from 'axios';
import { clearTokens, getAccessToken, saveAccessToken } from '../utils/storageUtils';

let isRefreshing = false
let refreshPromise = null

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

apiClient.interceptors.response.use((response) => {
    return response
}, async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        if (!isRefreshing) {
            isRefreshing = true
            refreshPromise = apiClient.post('/refresh', {}, {
                withCredentials: true
            }).then((response) => {
                saveAccessToken(response.data.token)
                // console.log(response)
                return response.data.token
            }).finally(() => {
                isRefreshing = false
            })

            try {
                // console.log(refreshPromise)
                const response = await refreshPromise
                originalRequest.headers.Authorization = `Bearer ${response}`
                return apiClient(originalRequest)
            } catch (refreshError) {
                // console.log(refreshError)
                // console.log(refreshError)
                clearTokens()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }
    }
    return Promise.reject(error)
})

export default apiClient;