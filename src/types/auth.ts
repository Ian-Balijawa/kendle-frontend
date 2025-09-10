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
  backgroundImage?: string;
  bio?: string;
  isVerified: boolean;
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  status?: string;
  // Optional fields for when viewing other users
  isFollowing?: boolean;
  isBlocked?: boolean;
  isBlockedBy?: boolean;
  // Online status fields for chat
  isOnline?: boolean;
  lastSeen?: string;
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
  firstName?: string;
  lastName?: string;
  email: string;
  whatsapp: string;
  twitterLink: string;
  tiktokLink: string;
  instagramLink: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  success: boolean;
  message: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  phoneNumber: string;
  expiresIn: number;
}

export interface ProfileData {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  whatsapp: string;
  twitterLink: string;
  tiktokLink: string;
  instagramLink: string;
  bio?: string;
  avatar?: File;
}
