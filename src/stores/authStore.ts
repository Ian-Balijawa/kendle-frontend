import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

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
    logout: () => void
    updateProfile: ( data: Partial<AuthStore> ) => void
    setLoading: ( loading: boolean ) => void
    setError: ( error: string | null ) => void
    clearError: () => void
    setOTPSent: ( sent: boolean ) => void
    setPhoneNumber: ( phone: string ) => void
}

export const useAuthStore = create<AuthStore>()(
    persist(
        ( set, _get ) => ( {
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            otpSent: false,
            phoneNumber: null,



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

            updateProfile: ( data: Partial<AuthStore> ) => {
                set( ( state ) => ( {
                    ...state,
                    ...data,
                } ) )
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
