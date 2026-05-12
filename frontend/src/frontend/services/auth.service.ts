import { post, get } from './api'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types'

export const authApi = {
  login: (data: LoginRequest) => 
    post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    post<AuthResponse>('/auth/register', data),
  
  logout: () => 
    post('/auth/logout'),
  
  getCurrentUser: () => 
    get<User>('/users/me'),
  
  refreshToken: () => 
    post<AuthResponse>('/auth/refresh-token'),
}

export default authApi
