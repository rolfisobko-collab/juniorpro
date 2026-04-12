import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth"
import { auth } from "./firebase"

const getActionCodeSettings = () => ({
  url: typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : 'https://techzonecde.com/login',
  handleCodeInApp: false,
})

export async function registerWithEmail(email: string, password: string, name: string) {
  try {
    // Verificar si el email ya está en uso (incluso con Google)
    const methods = await fetchSignInMethodsForEmail(auth, email)
    if (methods.length > 0) {
      const isGoogle = methods.includes('google.com')
      return {
        success: false,
        error: isGoogle
          ? "Este email ya está registrado con Google. Usá el botón 'Continuar con Google'."
          : "Este email ya está en uso. Iniciá sesión o recuperá tu contraseña."
      }
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    await sendEmailVerification(user, getActionCodeSettings())
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email || "",
        name: name,
        avatar: user.photoURL || undefined
      },
      needsVerification: true
    }
  } catch (error: any) {
    console.error("Firebase register error:", error)
    
    // Mapear errores de Firebase a mensajes amigables
    let errorMessage = "Error al registrar usuario"
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Este email ya está en uso"
        break
      case 'auth/weak-password':
        errorMessage = "La contraseña debe tener al menos 6 caracteres"
        break
      case 'auth/invalid-email':
        errorMessage = "Email inválido"
        break
      default:
        errorMessage = error.message || "Error al registrar usuario"
    }
    
    return { success: false, error: errorMessage }
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email || "",
        name: user.displayName || "",
        avatar: user.photoURL || undefined
      },
      needsVerification: !user.emailVerified
    }
  } catch (error: any) {
    console.error("Firebase login error:", error)
    
    let errorMessage = "Credenciales inválidas"
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Usuario no encontrado"
        break
      case 'auth/wrong-password':
        errorMessage = "Contraseña incorrecta"
        break
      case 'auth/user-disabled':
        errorMessage = "Usuario deshabilitado"
        break
      case 'auth/too-many-requests':
        errorMessage = "Demasiados intentos. Intenta más tarde"
        break
      default:
        errorMessage = error.message || "Credenciales inválidas"
    }
    
    return { success: false, error: errorMessage }
  }
}

export async function resetPassword(email: string) {
  try {
    await sendPasswordResetEmail(auth, email, getActionCodeSettings())
    return { success: true }
  } catch (error: any) {
    console.error("Firebase reset password error:", error)
    
    let errorMessage = "Error al enviar email de recuperación"
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No existe una cuenta con este email"
        break
      case 'auth/invalid-email':
        errorMessage = "Email inválido"
        break
      default:
        errorMessage = error.message || "Error al enviar email de recuperación"
    }
    
    return { success: false, error: errorMessage }
  }
}
