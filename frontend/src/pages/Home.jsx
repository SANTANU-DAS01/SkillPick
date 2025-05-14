"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../utils/api"
import { BookOpen, Search, ChevronRight } from "lucide-react"
import HeroBG from "../assets/upscalemedia-transformed.jpeg"
const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [categories, setCategories] = useState(["Computer Science", "Electrical", "Mechanical", "Civil", "Electronics"])
  const [semesters, setSemesters] = useState([1, 2, 3, 4, 5, 6])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const res = await api.get("/api/books?limit=6")
        setFeaturedBooks(res.data.data)
      } catch (error) {
        console.error("Error fetching books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedBooks()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      window.location.href = `/books?search=${encodeURIComponent(searchTerm)}`
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src={HeroBG}
            alt="Books background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Diploma Books for West Bengal Students
          </h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Access all your semester books in one place. Browse through our collection of books for all streams of
            Diploma in West Bengal.
          </p>

          <div className="mt-10 max-w-xl">
            <form onSubmit={handleSearch} className="sm:flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white focus:border-white sm:text-sm"
                  placeholder="Search for books by title, author, or category"
                />
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <button
                  type="submit"
                  className="block w-full py-3 px-4 rounded-md shadow bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Books</h2>
          <Link to="/books" className="text-indigo-600 hover:text-indigo-500 flex items-center">
            View all books
            <ChevronRight className="ml-1 h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={book.coverImage || "/placeholder.svg?height=300&width=400"}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${book.isFree ? "bg-green-100 text-green-800" : "bg-indigo-100 text-indigo-800"}`}
                    >
                      {book.isFree ? "Free" : `₹${book.price}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">By {book.author}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">{book.category}</span>
                    <Link
                      to={`/books/${book._id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Browse by Category Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/books?category=${encodeURIComponent(category)}`}
                className="bg-white rounded-lg shadow-md p-6 flex items-center hover:shadow-lg transition-shadow duration-300"
              >
                <BookOpen className="h-8 w-8 text-indigo-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500">Browse all {category} books</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Semester Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by Semester</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {semesters.map((semester) => (
            <Link
              key={semester}
              to={`/books?semester=${semester}`}
              className="bg-indigo-600 rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center hover:bg-indigo-700 transition-colors duration-300"
            >
              <span className="text-3xl font-bold text-white">{semester}</span>
              <span className="text-sm text-indigo-100 mt-2">Semester</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-200">Start exploring our collection today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/books"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Browse Books
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
