"use client"

import { useContext } from "react"
import { Link, useLocation } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import { Home, User, Book, Users, PlusCircle, LogOut, BookOpen } from "lucide-react"

const Sidebar = ({ isAdmin = false }) => {
  const location = useLocation()
  const { user, logout } = useContext(AuthContext)

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const userLinks = [
    { path: "/dashboard/profile", icon: <User size={20} />, label: "Profile" },
    { path: "/dashboard/my-books", icon: <Book size={20} />, label: "My Books" },
  ]

  const adminLinks = [
    { path: "/admin/books", icon: <Book size={20} />, label: "Manage Books" },
    { path: "/admin/books/add", icon: <PlusCircle size={20} />, label: "Add Book" },
    { path: "/admin/users", icon: <Users size={20} />, label: "Manage Users" },
  ]

  const links = isAdmin ? adminLinks : userLinks

  return (
    <div className="bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <div className="flex items-center space-x-2 px-4">
        <BookOpen className="h-8 w-8" />
        <span className="text-2xl font-extrabold">DiplomaBooks</span>
      </div>

      <div className="flex flex-col items-center mt-6 -mx-2">
        <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h4 className="mx-2 mt-2 font-medium text-white">{user?.name}</h4>
        <p className="mx-2 mt-1 text-sm font-medium text-indigo-200">{user?.email}</p>
        <span className="mx-2 mt-1 px-2 py-1 bg-indigo-700 rounded-full text-xs">
          {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
        </span>
      </div>

      <nav className="mt-6">
        <div className="space-y-2 px-4">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-2 py-2.5 px-4 rounded transition duration-200 ${
                isActive(link.path) ? "bg-indigo-700 text-white" : "hover:bg-indigo-700 text-indigo-100"
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <Link to="/" className="flex items-center space-x-2 py-2.5 px-4 rounded text-indigo-100 hover:bg-indigo-700">
            <Home size={20} />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 py-2.5 px-4 rounded text-indigo-100 hover:bg-indigo-700"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar
