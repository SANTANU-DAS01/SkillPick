"use client"

import { Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../../context/AuthContext"
import Spinner from "../ui/Spinner"

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <Spinner />
  }

  return isAuthenticated && (user.role === "admin" || user.role === "instructor") ? children : <Navigate to="/login" />
}

export default AdminRoute
