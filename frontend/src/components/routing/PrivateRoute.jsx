"use client"

import { Navigate } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../../context/AuthContext"
import Spinner from "../ui/Spinner"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext)

  if (loading) {
    return <Spinner />
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default PrivateRoute
