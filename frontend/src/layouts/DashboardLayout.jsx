"use client"

import { Outlet } from "react-router-dom"
import { useContext } from "react"
import AuthContext from "../context/AuthContext"
import Sidebar from "../components/navigation/Sidebar"
import DashboardHeader from "../components/navigation/DashboardHeader"

const DashboardLayout = ({ isAdmin = false }) => {
  const { user } = useContext(AuthContext)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
