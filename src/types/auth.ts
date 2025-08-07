export interface User {
  id: string
  username: string
  email: string
  phoneNumber?: string
  firstName: string
  lastName: string
  avatar?: string
  bio?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  followersCount: number
  followingCount: number
  postsCount: number
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  phoneNumber: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ProfileData {
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: File
}
