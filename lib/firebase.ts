import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser, setPersistence, browserLocalPersistence } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIlk75d-KacbWovfp9CqIRg6kHrqOPEa0",
  authDomain: "techzonecde.firebaseapp.com",
  projectId: "techzonecde",
  storageBucket: "techzonecde.firebasestorage.app",
  messagingSenderId: "1078130997384",
  appId: "1:1078130997384:web:d1d75cb24b3af10d3fc73d"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Set persistence to local (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch(console.error)

// Firebase Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error("Error signing in with Google:", error)
    throw error
  }
}

export const firebaseSignOut = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return auth.onAuthStateChanged(callback)
}

export type { FirebaseUser }
