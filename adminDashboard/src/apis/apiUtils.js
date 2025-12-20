const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
import { QueryClient } from "@tanstack/react-query"
import axios, { isAxiosError } from "axios"
import { clearTokens, getAccessToken, saveAccessToken } from "../utils/storageUtils"
import { tostMessage } from "../components/toastMessage"
import apiClient from "./apiClient"

export const queryClient = new QueryClient()

const apiUtils = async (method, endpoint, headers = {}, data = null, signal = null) => {

    try {
        const response = await apiClient({
            method,
            // url: `${BASE_URL}${endpoint}`,
            url: endpoint,
            headers: { ...headers },
            data,
            signal,
        })
        return response.data
    } catch (error) {
        // console.log(error)
        if (isAxiosError(error)) {
            const status = error?.response?.status
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'

            // if (status === 401) {
            //     try {
            //         // Refresh token is now in httpOnly cookie, no need to send it in body
            //         const response = await axios.post(`${BASE_URL}/refresh`, {}, {
            //             withCredentials: true // Send cookies with refresh request
            //         })
            //         saveAccessToken(response.data.token)
            //         // Refresh token is automatically stored in httpOnly cookie by backend
            //         // Retry request with new token
            //         return apiUtils(method, endpoint, headers, data, signal)
            //     } catch (refreshError) {
            //         clearTokens()
            //         tostMessage('Error', refreshError.message || 'Session expired!', 'error')
            //         setTimeout(() => {
            //             window.location.href = '/login'
            //         }, 1000)
            //     }
            // }

            throw new Error(message)
        }
        throw new Error('Unexpected error occurred')
    }
}

export default apiUtils