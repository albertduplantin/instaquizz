import { useState, useEffect } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { signIn, signUp, signOutUser } from '../lib/firebaseServices'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { user, error } = await signIn(email, password)
    if (error) {
      throw error
    }
    return user
  }

  const register = async (email: string, password: string, name: string) => {
    const { user, error } = await signUp(email, password, name)
    if (error) {
      throw error
    }
    return user
  }

  const logout = async () => {
    const { error } = await signOutUser()
    if (error) {
      throw error
    }
  }

  return {
    user,
    loading,
    login,
    register,
    logout
  }
} 