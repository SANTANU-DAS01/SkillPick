"use client"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import api from "../utils/api"
import { Search, Filter, ChevronDown, Star, X } from "lucide-react"

const AllBooks = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || "")
  const [selectedStream, setSelectedStream] = useState(queryParams.get("stream") || "")
  const [selectedSemester, setSelectedSemester] = useState(queryParams.get("semester") || "")
  const [priceFilter, setPriceFilter] = useState(queryParams.get("free") || "")
  const [showFilters, setShowFilters] = useState(false)

  const streams = ['All','PHO','DP','ARCH','FWT','CST','ME','CE','SE','CFS','EE','ETCE','CAU','CSE','CSWT','IT','ETE','ICE','ECE','LGT','MEP','GIS & GPS','EEIC','EEPS','EEE','MOPM','TT']
  const semesters = [1, 2, 3, 4, 5, 6]

  useEffect(() => {
    fetchBooks()
  }, [location.search])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(location.search)
      const page = params.get("page") || 1

      const res = await api.get(`/api/books?${params.toString()}&page=${page}&limit=12`)
      setBooks(res.data.data)
      setPagination({
        page: Number.parseInt(page),
        pages: res.data.pagination.pages,
        total: res.data.pagination.total,
      })
    } catch (err) {
      setError("Failed to fetch books. Please try again later.")
      console.error("Error fetching books:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (searchTerm) params.append("search", searchTerm)
    if (selectedStream) params.append("stream", selectedStream)
    if (selectedSemester) params.append("semester", selectedSemester)
    if (priceFilter) params.append("free", priceFilter)

    window.location.href = `/books?${params.toString()}`
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedStream("")
    setSelectedSemester("")
    setPriceFilter("")
    window.location.href = "/books"
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search)
    params.set("page", page)
    window.location.href = `/books?${params.toString()}`
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Browse Books</h1>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-indigo-600 hover:text-indigo-500 md:hidden"
          >
            <Filter className="h-5 w-5 mr-1" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden"} lg:block`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </button>
              </div>

              <form onSubmit={handleSearch}>
                <div className="mb-6">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Search by title or author"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-2">
                    Stream
                  </label>
                  <select
                    id="stream"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Streams</option>
                    {streams.map((stream) => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-2">
                    Semester
                  </label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Semesters</option>
                    {semesters.map((semester) => (
                      <option key={semester} value={semester}>
                        Semester {semester}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="price-all"
                        name="price"
                        type="radio"
                        checked={priceFilter === ""}
                        onChange={() => setPriceFilter("")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="price-all" className="ml-3 text-sm text-gray-700">
                        All
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="price-free"
                        name="price"
                        type="radio"
                        checked={priceFilter === "true"}
                        onChange={() => setPriceFilter("true")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="price-free" className="ml-3 text-sm text-gray-700">
                        Free
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="price-paid"
                        name="price"
                        type="radio"
                        checked={priceFilter === "false"}
                        onChange={() => setPriceFilter("false")}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <label htmlFor="price-paid" className="ml-3 text-sm text-gray-700">
                        Paid
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </div>

          {/* Books Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search criteria.</p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
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
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-gray-600 ml-1">
                              {book.rating ? book.rating.toFixed(1) : "N/A"}
                            </span>
                          </div>
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

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronDown className="h-5 w-5 transform rotate-90" />
                      </button>

                      {[...Array(pagination.pages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            pagination.page === i + 1
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          pagination.page === pagination.pages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronDown className="h-5 w-5 transform -rotate-90" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllBooks
