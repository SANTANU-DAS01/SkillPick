"use client"

import { createContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import api from "../utils/api"

const AuthContext = createContext()
let me
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set token in axios headers and localStorage
  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
    } else {
      delete api.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token)
        try {
          const res = await api.get("/api/auth/me")
          console.log(res);

          setUser(res.data.data)
          me = res.data.data
          setIsAuthenticated(true)
        } catch (err) {
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
          setAuthToken(null)
          setError(err.response?.data?.error || "Authentication failed")
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const res = await api.post("/api/auth/register", userData)
      setToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setAuthToken(res.data.token)
      toast.success("Registration successful!")
      return true
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Registration failed"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const res = await api.post("/api/auth/login", { email, password })      
      setToken(res.data.token)
      setUser(res.data.user)
      setIsAuthenticated(true)
      setAuthToken(res.data.token)
      toast.success("Login successful!")
      return true
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Login failed"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await api.post("/api/auth/logout")
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setToken(null)
      setUser(null)
      setIsAuthenticated(false)
      setAuthToken(null)
      toast.success("Logged out successfully")
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const userId = user?._id || user?.id
      if (!userId) {
        throw new Error("User ID is undefined")
      }
      const res = await api.put(`/api/users/${userId}`, userData)
      setUser(res.data.data)
      toast.success("Profile updated successfully")
      return true
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Update failed"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true)
      setError(null) // Clear previous errors
      const userId = user?._id || user?.id
      if (!userId) {
        throw new Error("User ID is undefined")
      }
      await api.put(`/api/users/${userId}/password`, passwordData)
      toast.success("Password changed successfully")
      return true
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Password change failed"
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export {me}
export default AuthContext
