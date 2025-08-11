export interface User {
  id: string;
  phoneNumber: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  whatsapp?: string;
  twitterLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface PhoneAuthData {
  phoneNumber: string;
}

export interface OTPVerificationData {
  phoneNumber: string;
  otp: string;
}

export interface ProfileCompletionData {
  username: string;
  email: string;
  whatsapp: string;
  twitterLink: string;
  tiktokLink: string;
  instagramLink: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface ProfileData {
  username: string;
  email: string;
  whatsapp: string;
  twitterLink: string;
  tiktokLink: string;
  instagramLink: string;
  avatar: File;
}
