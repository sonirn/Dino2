"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { createUserProfile } from "@/lib/firebase-utils"
import { getAnalytics } from "firebase/analytics"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZKtnnm3hc6ViJLSLhV7PK8calqELiL_4",
  authDomain: "magic-image-ai-15a0d.firebaseapp.com",
  databaseURL: "https://magic-image-ai-15a0d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "magic-image-ai-15a0d",
  storageBucket: "magic-image-ai-15a0d.firebasestorage.app",
  messagingSenderId: "864109068756",
  appId: "1:864109068756:web:2d680b0c0d5b791f32d641",
  measurementId: "G-M6EM5CCVQ2",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Initialize Analytics only in browser environment
let analytics = null
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app)
  } catch (error) {
    console.error("Analytics initialization error:", error)
  }
}

export { auth, db }

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<any>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<any>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          // User is signed in
          await createUserProfile(result.user)
        }
      } catch (error) {
        console.error("Redirect result error:", error)
      }
    }

    checkRedirectResult()
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      // Add scopes
      provider.addScope("email")
      provider.addScope("profile")

      // Use redirect method instead of popup for better compatibility
      await signInWithRedirect(auth, provider)

      // The result will be handled in the useEffect above
    } catch (error) {
      console.error("Google sign-in error:", error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result
    } catch (error) {
      console.error("Email sign-in error:", error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(result.user, {
        displayName: displayName,
      })

      // Create user profile in Firestore
      await createUserProfile(result.user)

      return result
    } catch (error) {
      console.error("Email sign-up error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
