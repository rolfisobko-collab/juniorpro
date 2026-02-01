"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DISABLE_AUTH_ENV = process.env.NEXT_PUBLIC_DISABLE_AUTH === "1"
const DEMO_USER_STORAGE_KEY = "tz_demo_user"
const DISABLE_AUTH_STORAGE_KEY = "tz_disable_auth"

function isAuthDisabled() {
  if (DISABLE_AUTH_ENV) return true
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(DISABLE_AUTH_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (isAuthDisabled()) {
          // Demo mode - usar localStorage
          const stored = localStorage.getItem(DEMO_USER_STORAGE_KEY)
          if (!stored) {
            if (!cancelled) setUser(null)
          } else {
            try {
              const parsedUser = JSON.parse(stored)
              if (!cancelled) setUser(parsedUser)
            } catch {
              if (!cancelled) setUser(null)
            }
          }
        } else {
          // Real Firebase - escuchar cambios de auth
          const { onAuthStateChanged } = await import("@/lib/firebase")
          const unsubscribe = onAuthStateChanged((firebaseUser) => {
            if (!cancelled) {
              if (firebaseUser) {
                const user = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  name: firebaseUser.displayName || "",
                  avatar: firebaseUser.photoURL || undefined
                }
                setUser(user)
              } else {
                setUser(null)
              }
              setIsLoading(false)
            }
          })

          return () => {
            unsubscribe()
          }
        }
      } catch (error) {
        console.error("Auth loading error:", error)
        if (!cancelled) setUser(null)
      } finally {
        if (isAuthDisabled() && !cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (isAuthDisabled()) {
        const demoUser: User = {
          id: "demo",
          email: (email ?? "").trim() || "demo@techzone.com",
          name: "Usuario Demo",
        }
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        return
      }

      // Usar sistema de autenticación DIRECTAMENTE - sin API
      const { loginWithEmail } = await import("@/lib/firebase-auth-email")
      const result = await loginWithEmail(email, password)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      if (result.user) {
        setUser(result.user)
      }
      
      // Si necesita verificación, lanzar error especial
      if (result.needsVerification) {
        throw new Error(`VERIFY_NEEDED:${result.user.email}`)
      }

    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      if (isAuthDisabled()) {
        // Demo mode - create mock Google user
        const mockUser = {
          id: "google-demo-user",
          email: "demo@gmail.com",
          name: "Demo Google User",
          avatar: "https://lh3.googleusercontent.com/a/default-user"
        }
        setUser(mockUser)
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(mockUser))
        return
      }

      // Real Firebase Google login
      const { signInWithGoogle } = await import("@/lib/firebase")
      const firebaseUser = await signInWithGoogle()
      
      const user = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        avatar: firebaseUser.photoURL || undefined
      }
      
      setUser(user)
      localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(user))
      
      // Crear cookies para el backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          provider: 'google',
          providerId: firebaseUser.uid
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Las cookies se establecen automáticamente desde el backend
        console.log('Login successful, cookies set')
      }
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    }
  }

  const loginWithFacebook = async () => {
    // Facebook removed - throw error
    throw new Error("Facebook login is not available")
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      if (isAuthDisabled()) {
        const demoUser: User = {
          id: "demo",
          email: (email ?? "").trim() || "demo@techzone.com",
          name: (name ?? "").trim() || "Usuario Demo",
        }
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser))
        setUser(demoUser)
        return
      }

      // Usar sistema de autenticación DIRECTAMENTE - sin API
      const { registerWithEmail } = await import("@/lib/firebase-auth-email")
      const result = await registerWithEmail(email, password, name)
      
      if (!result.success) {
        throw new Error(result.error)
      }
      
      if (result.user) {
        setUser(result.user)
      }
      
      // Firebase envía email automático - mostrar mensaje
      throw new Error("VERIFY_NEEDED:Revisa tu email para verificar tu cuenta. Firebase envió el link automáticamente.")

    } catch (error) {
      console.error("Register error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (isAuthDisabled()) {
        // Demo mode - limpiar localStorage
        localStorage.removeItem(DEMO_USER_STORAGE_KEY)
        setUser(null)
        return
      }

      // Real Firebase logout
      const { firebaseSignOut } = await import("@/lib/firebase")
      await firebaseSignOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      // Forzar logout aunque haya error
      setUser(null)
    }

    localStorage.removeItem("cart")
    localStorage.removeItem("favorites")
  }

  const resetPassword = async (email: string) => {
    try {
      if (isAuthDisabled()) {
        // Demo mode - mock success
        return
      }

      // Usar Firebase para reset de password
      const { resetPassword } = await import("@/lib/firebase-auth-email")
      const result = await resetPassword(email)
      
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        resetPassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
