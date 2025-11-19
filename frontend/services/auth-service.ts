import apiClient from './api-client'
import { LoginData, RegisterData, AuthResponse, User } from '@/types/auth'

class AuthService {
  async login(loginData: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', loginData)
    if (response.data.accessToken && response.data.refreshToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken)
      this.setUser(response.data.user)
    }
    return response.data
  }

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', registerData)
    if (response.data.accessToken && response.data.refreshToken) {
      this.setTokens(response.data.accessToken, response.data.refreshToken)
      this.setUser(response.data.user)
    }
    return response.data
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    this.setUser(response.data.user)
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    })
    this.setTokens(response.data.accessToken, response.data.refreshToken)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }

  logout(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
  }
  

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('accessToken')
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export const authService = new AuthService()