import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, LoginData, RegisterData, AuthResponse } from '../types'

interface AuthStore {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: ( credentials: LoginData ) => Promise<void>
    register: ( data: RegisterData ) => Promise<void>
    logout: () => void
    updateProfile: ( data: Partial<User> ) => void
    setLoading: ( loading: boolean ) => void
    setError: ( error: string | null ) => void
    clearError: () => void
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

            login: async ( credentials: LoginData ) => {
                set( { isLoading: true, error: null } )
                try {
                    // TODO: Implement actual API call
                    const response: AuthResponse = {
                        user: {
                            id: '1',
                            username: credentials.email,
                            email: credentials.email,
                            firstName: 'John',
                            lastName: 'Doe',
                            isVerified: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            followersCount: 0,
                            followingCount: 0,
                            postsCount: 0,
                        },
                        token: 'mock-token',
                        refreshToken: 'mock-refresh-token',
                    }

                    set( {
                        user: response.user,
                        token: response.token,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    } )
                } catch ( error ) {
                    set( {
                        error: error instanceof Error ? error.message : 'Login failed',
                        isLoading: false,
                    } )
                }
            },

            register: async ( data: RegisterData ) => {
                set( { isLoading: true, error: null } )
                try {
                    // TODO: Implement actual API call
                    const response: AuthResponse = {
                        user: {
                            id: '1',
                            username: data.username,
                            email: data.email,
                            phoneNumber: data.phoneNumber,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            isVerified: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            followersCount: 0,
                            followingCount: 0,
                            postsCount: 0,
                        },
                        token: 'mock-token',
                        refreshToken: 'mock-refresh-token',
                    }

                    set( {
                        user: response.user,
                        token: response.token,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    } )
                } catch ( error ) {
                    set( {
                        error: error instanceof Error ? error.message : 'Registration failed',
                        isLoading: false,
                    } )
                }
            },

            logout: () => {
                set( {
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
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
