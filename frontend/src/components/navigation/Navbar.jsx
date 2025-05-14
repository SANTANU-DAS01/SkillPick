"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import AuthContext from "../../context/AuthContext"
import { BookOpen, Menu, X, User, LogOut } from "lucide-react"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isAuthenticated, user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <BookOpen className="h-8 w-8 text-white" />
                <span className="ml-2 text-xl font-bold text-white">SkillPick</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className="text-white hover:text-indigo-100 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/books" className="text-white hover:text-indigo-100 px-3 py-2 text-sm font-medium">
                Books
              </Link>
              <Link to="/about" className="text-white hover:text-indigo-100 px-3 py-2 text-sm font-medium">
                About
              </Link>
              <Link to="/contact" className="text-white hover:text-indigo-100 px-3 py-2 text-sm font-medium">
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="relative">
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex cursor-pointer items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-white">{user?.name}</span>
                  </button>
                </div>
                {dropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    {(user?.role === "admin" || user?.role === "instructor") && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-white hover:text-indigo-100 px-3 py-2 text-sm font-medium flex items-center">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-100 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/books"
              className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsOpen(false)}
            >
              Books
            </Link>
            <Link
              to="/about"
              className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-indigo-700">
            {isAuthenticated ? (
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.name}</div>
                  <div className="text-sm font-medium text-indigo-200">{user?.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4 px-5 py-3">
                <Link
                  to="/login"
                  className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-base font-medium flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="mr-2 h-5 w-5" />
                  Dashboard
                </Link>
                {(user?.role === "admin" || user?.role === "instructor") && (
                  <Link
                    to="/admin"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-indigo-700"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
