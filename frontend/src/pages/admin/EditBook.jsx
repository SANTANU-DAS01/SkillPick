"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import api from "../../utils/api"
import { Upload } from "lucide-react"

const EditBook = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: 0,
    isFree: false,
    category: "",
    tags: "",
  })

  const [coverImage, setCoverImage] = useState(null)
  const [bookFile, setBookFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [originalBook, setOriginalBook] = useState(null)

  const { title, author, description, price, isFree, category, tags } = formData

  useEffect(() => {
    fetchBook()
  }, [id])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/api/books/${id}`)
      const book = res.data.data
      setOriginalBook(book)

      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        isFree: book.isFree,
        category: book.category,
        tags: book.tags ? book.tags.join(", ") : "",
      })
    } catch (err) {
      toast.error("Failed to fetch book details")
      console.error("Error fetching book:", err)
      navigate("/admin/books")
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handleCoverImageChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0])
    }
  }

  const handleBookFileChange = (e) => {
    if (e.target.files[0]) {
      setBookFile(e.target.files[0])
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!title) newErrors.title = "Title is required"
    if (!author) newErrors.author = "Author is required"
    if (!description) newErrors.description = "Description is required"
    if (!category) newErrors.category = "Category is required"
    if (!isFree && (!price || price <= 0)) newErrors.price = "Price must be greater than 0 for paid books"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file, relatedModel, relatedId) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("relatedModel", relatedModel)
    formData.append("relatedId", relatedId)

    const res = await api.post("/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return res.data.data
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setSubmitting(true)

      // Prepare book data
      const bookData = {
        ...formData,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      }

      // Upload new files if provided
      if (coverImage) {
        const coverImageData = await uploadFile(coverImage, "Book", id)
        bookData.coverImage = coverImageData.fileUrl
      }

      if (bookFile) {
        const bookFileData = await uploadFile(bookFile, "Book", id)
        bookData.fileUrl = bookFileData.fileUrl
        bookData.fileId = bookFileData.fileId
      }

      // Update book
      await api.put(`/api/books/${id}`, bookData)

      toast.success("Book updated successfully!")
      navigate("/admin/books")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update book")
      console.error("Error updating book:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Book</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${
                errors.title ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={author}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${
                errors.author ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.author && <p className="mt-1 text-sm text-red-600">{errors.author}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${
                errors.description ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={onChange}
              className={`block w-full px-3 py-2 border ${
                errors.category ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <option value="">Select Category</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electronics">Electronics</option>
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={tags}
              onChange={onChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. programming, semester1, java"
            />
          </div>

          <div>
            <div className="flex items-center mb-1">
              <input
                id="isFree"
                name="isFree"
                type="checkbox"
                checked={isFree}
                onChange={onChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isFree" className="ml-2 block text-sm font-medium text-gray-700">
                Free Book
              </label>
            </div>
            {!isFree && (
              <div className="mt-2">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={price}
                  onChange={onChange}
                  min="0"
                  step="0.01"
                  className={`block w-full px-3 py-2 border ${
                    errors.price ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
              Cover Image
            </label>
            {originalBook && originalBook.coverImage && (
              <div className="mb-2">
                <img
                  src={originalBook.coverImage || "/placeholder.svg"}
                  alt="Current cover"
                  className="h-20 w-20 object-cover rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Current cover image</p>
              </div>
            )}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="coverImage"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a new cover</span>
                    <input
                      id="coverImage"
                      name="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {coverImage && <p className="text-xs text-green-500">{coverImage.name}</p>}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="bookFile" className="block text-sm font-medium text-gray-700 mb-1">
              Book File (PDF)
            </label>
            {originalBook && originalBook.fileUrl && (
              <div className="mb-2">
                <p className="text-xs text-gray-500">
                  Current file:{" "}
                  <a
                    href={originalBook.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    View current file
                  </a>
                </p>
              </div>
            )}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="bookFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a new file</span>
                    <input
                      id="bookFile"
                      name="bookFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleBookFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 50MB</p>
                {bookFile && <p className="text-xs text-green-500">{bookFile.name}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? "Updating..." : "Update Book"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditBook
