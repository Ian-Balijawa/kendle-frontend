import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, PhoneAuthData, OTPVerificationData, ProfileCompletionData, AuthResponse, OTPResponse } from '../types'

interface AuthStore {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    otpSent: boolean
    phoneNumber: string | null

    // Actions
    sendOTP: (data: PhoneAuthData) => Promise<OTPResponse>
    verifyOTP: (data: OTPVerificationData) => Promise<AuthResponse>
    completeProfile: (data: ProfileCompletionData) => Promise<void>
    logout: () => void
    updateProfile: (data: Partial<User>) => void
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    clearError: () => void
    setOTPSent: (sent: boolean) => void
    setPhoneNumber: (phone: string) => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        ( set, get ) => ( {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            otpSent: false,
            phoneNumber: null,

            sendOTP: async (data: PhoneAuthData) => {
                set( { isLoading: true, error: null } )
                try {
                    // TODO: Implement actual SMS API call
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
                    
                    const response: OTPResponse = {
                        success: true,
                        message: 'OTP sent successfully',
                        expiresIn: 300 // 5 minutes
                    }

                    set( {
                        otpSent: true,
                        phoneNumber: data.phoneNumber,
                        isLoading: false,
                    } )

                    return response
                } catch ( error ) {
                    set( {
                        error: error instanceof Error ? error.message : 'Failed to send OTP',
                        isLoading: false,
                    } )
                    throw error
                }
            },

            verifyOTP: async (data: OTPVerificationData) => {
                set( { isLoading: true, error: null } )
                try {
                    // TODO: Implement actual OTP verification API call
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

                    // Simulate checking if user exists
                    const isNewUser = Math.random() > 0.5 // Random for demo
                    
                    if (isNewUser) {
                        // New user - return minimal user data
                        const response: AuthResponse = {
                            user: {
                                id: '1',
                                phoneNumber: data.phoneNumber,
                                isVerified: true,
                                isProfileComplete: false,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                followersCount: 0,
                                followingCount: 0,
                                postsCount: 0,
                            },
                            token: 'mock-token',
                            refreshToken: 'mock-refresh-token',
                            isNewUser: true,
                        }

                        set( {
                            user: response.user,
                            token: response.token,
                            refreshToken: response.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                        } )

                        return response
                    } else {
                        // Existing user - return complete user data
                        const response: AuthResponse = {
                            user: {
                                id: '1',
                                phoneNumber: data.phoneNumber,
                                firstName: 'John',
                                lastName: 'Doe',
                                email: 'john@example.com',
                                whatsapp: '+1234567890',
                                twitterLink: 'https://twitter.com/johndoe',
                                tiktokLink: 'https://tiktok.com/@johndoe',
                                instagramLink: 'https://instagram.com/johndoe',
                                isVerified: true,
                                isProfileComplete: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                followersCount: 42,
                                followingCount: 38,
                                postsCount: 15,
                            },
                            token: 'mock-token',
                            refreshToken: 'mock-refresh-token',
                            isNewUser: false,
                        }

                        set( {
                            user: response.user,
                            token: response.token,
                            refreshToken: response.refreshToken,
                            isAuthenticated: true,
                            isLoading: false,
                        } )

                        return response
                    }
                } catch ( error ) {
                    set( {
                        error: error instanceof Error ? error.message : 'OTP verification failed',
                        isLoading: false,
                    } )
                    throw error
                }
            },

            completeProfile: async (data: ProfileCompletionData) => {
                set( { isLoading: true, error: null } )
                try {
                    // TODO: Implement actual profile completion API call
                    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

                    const { user } = get()
                    if (user) {
                        const updatedUser: User = {
                            ...user,
                            ...data,
                            isProfileComplete: true,
                            updatedAt: new Date().toISOString(),
                        }

                        set( {
                            user: updatedUser,
                            isLoading: false,
                        } )
                    }
                } catch ( error ) {
                    set( {
                        error: error instanceof Error ? error.message : 'Profile completion failed',
                        isLoading: false,
                    } )
                    throw error
                }
            },

            logout: () => {
                set( {
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                    otpSent: false,
                    phoneNumber: null,
                } )
            },

            updateProfile: ( data: Partial<User> ) => {
                const { user } = get()
                if ( user ) {
                    set( {
                        user: { ...user, ...data },
                    } )
                }
            },

            setLoading: ( loading: boolean ) => {
                set( { isLoading: loading } )
            },

            setError: ( error: string | null ) => {
                set( { error } )
            },

            clearError: () => {
                set( { error: null } )
            },

            setOTPSent: ( sent: boolean ) => {
                set( { otpSent: sent } )
            },

            setPhoneNumber: ( phone: string ) => {
                set( { phoneNumber: phone } )
            },
        } ),
        {
            name: 'auth-storage',
            partialize: ( state ) => ( {
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            } ),
        }
    )
)
