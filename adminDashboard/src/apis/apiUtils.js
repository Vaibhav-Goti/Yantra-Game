const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
import { QueryClient } from "@tanstack/react-query"
import axios, { isAxiosError } from "axios"
import { clearTokens, getAccessToken, getRefreshToken, saveAccessToken, saveRefreshToken } from "../utils/storageUtils"

export const queryClient = new QueryClient()
const refreshToken = getRefreshToken()
const accessToken = getAccessToken()

const apiUtils = async (method, endpoint, headers = {}, data = null, signal = null) => {
    const accessToken = getAccessToken()
    const refreshToken = getRefreshToken()

    try {
        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { ...headers, Authorization: `Bearer ${accessToken}` },
            data,
            signal,
        })
        return response.data
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error?.response?.status
            const message = error?.response?.data?.message || error?.message || 'Something went wrong'

            if (status === 401) {
                if (refreshToken) {
                    try {
                        const response = await axios.post(`${BASE_URL}/refresh`, { refreshToken })
                        saveAccessToken(response.data.token)
                        saveRefreshToken(response.data.refreshToken)
                        // Retry request with new token
                        return apiUtils(method, endpoint, headers, data, signal)
                    } catch (refreshError) {
                        clearTokens()
                        window.location.href = '/login'
                    }
                } else {
                    clearTokens()
                    window.location.href = '/login'
                }
            }

            throw new Error(message)
        }
        throw new Error('Unexpected error occurred')
    }
}

export default apiUtils