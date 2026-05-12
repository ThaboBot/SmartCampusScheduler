import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse, ApiError } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const get = <T>(url: string) => 
  apiClient.get<ApiResponse<T>>(url).then(res => res.data)

export const post = <T>(url: string, data?: unknown) => 
  apiClient.post<ApiResponse<T>>(url, data).then(res => res.data)

export const put = <T>(url: string, data?: unknown) => 
  apiClient.put<ApiResponse<T>>(url, data).then(res => res.data)

export const patch = <T>(url: string, data?: unknown) => 
  apiClient.patch<ApiResponse<T>>(url, data).then(res => res.data)

export const del = <T>(url: string) => 
  apiClient.delete<ApiResponse<T>>(url).then(res => res.data)

export default apiClient
