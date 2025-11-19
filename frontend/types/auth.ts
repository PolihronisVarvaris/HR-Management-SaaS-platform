export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CANDIDATE' | 'HR_EMPLOYEE' | 'RECRUITMENT_ADMIN' 
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'CANDIDATE' | 'HR_EMPLOYEE' | 'RECRUITMENT_ADMIN'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}