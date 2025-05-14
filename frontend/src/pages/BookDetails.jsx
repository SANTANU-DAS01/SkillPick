"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../utils/api";
import AuthContext from "../context/AuthContext";
import {
  ArrowLeft,
  Download,
  Star,
  User,
  Calendar,
  Tag,
  BookOpen,
  Edit,
  Trash,
  FileText,
} from "lucide-react";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/books/${id}`);
      setBook(res.data.data);
    } catch (err) {
      setError("Failed to fetch book details. Please try again later.");
      console.error("Error fetching book:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to purchase this book");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post(`/api/books/${id}/purchase`);
      toast.success("Book purchased successfully!");

      // Update the user context to include this book in purchasedBooks
      if (
        user &&
        user.purchasedBooks &&
        !user.purchasedBooks.includes(book._id)
      ) {
        user.purchasedBooks.push(book._id);
      }

      // Update book state to reflect purchase immediately
      setBook((prevBook) => ({
        ...prevBook,
        purchased: true,
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to purchase book");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to submit a review");
      navigate("/login");
      return;
    }

    if (!reviewText.trim()) {
      toast.error("Please enter a review");
      return;
    }

    try {
      setSubmittingReview(true);
      await api.post(`/api/books/${id}/reviews`, {
        rating: reviewRating,
        text: reviewText,
      });
      toast.success("Review submitted successfully!");
      setReviewText("");
      setReviewRating(5);
      fetchBook(); // Refresh book data with new review
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteBook = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone.",
      )
    ) {
      try {
        await api.delete(`/api/books/${id}`);
        toast.success("Book deleted successfully");
        navigate("/admin/books");
      } catch (err) {
        toast.error(err.response?.data?.error || "Failed to delete book");
      }
    }
  };

  // Function to handle file download or viewing
  const handleFileAccess = (e) => {
    // For PDFs, open in a new tab instead of downloading directly
    if (book.format && book.format.toLowerCase() === "pdf") {
      e.preventDefault();
      window.open(book.fileUrl, "_blank");
    }
    // For other file types, the default download behavior will work
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || "Book not found"}
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/books"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Books
        </Link>
      </div>
    );
  }

  const isOwner =
    user && (user.id === book.createdBy._id || user.role === "admin");
  const hasAlreadyReviewed = book.reviews.some(
    (review) => review.user._id === user?.id,
  );
  const hasPurchased = user?.purchasedBooks?.includes(book._id) || book.isFree;
  const isPdf = book.format && book.format.toLowerCase() === "pdf";

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/books"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Books
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Cover */}
            <div className="md:col-span-1 p-6 flex justify-center">
              <img
                src={book.coverImage || "/placeholder.svg"}
                alt={book.title}
                className="w-full max-w-xs rounded-lg shadow-md object-cover"
              />
            </div>

            {/* Book Details */}
            <div className="md:col-span-2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${book.isFree ? "bg-green-100 text-green-800" : "bg-indigo-100 text-indigo-800"}`}
                >
                  Free
                </span>
              </div>

              <p className="text-lg text-gray-600 mb-4">By {book.author}</p>

              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-gray-700">
                    {book.rating ? book.rating.toFixed(1) : "No ratings yet"}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({book.reviews.length}{" "}
                    {book.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>Uploaded by {book.createdBy.name}</span>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-gray-700">
                    <span className="font-medium">Category:</span>{" "}
                    {book.category}
                  </span>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-gray-700">
                    <span className="font-medium">Published:</span>{" "}
                    {new Date(book.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {hasPurchased ? (
                  <a
                    href={book.fileUrl}
                    download={`${book.title}.${book.format || "pdf"}`}
                    target={isPdf ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleFileAccess}
                  >
                    {isPdf ? (
                      <FileText className="h-5 w-5 mr-2" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    {isPdf ? "View PDF" : "Download Book"}
                  </a>
                ) : (
                  <button
                    onClick={handlePurchase}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Enroll to Get the Book
                  </button>
                )}

                {isOwner && (
                  <>
                    <Link
                      to={`/admin/books/edit/${book._id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Book
                    </Link>

                    <button
                      onClick={handleDeleteBook}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash className="h-5 w-5 mr-2" />
                      Delete Book
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          {/* Add Review Form */}
          {isAuthenticated && !hasAlreadyReviewed && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add Your Review
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label
                    htmlFor="rating"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rating
                  </label>
                  <select
                    id="rating"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="review"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Write your review here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {book.reviews.length > 0 ? (
            <div className="space-y-6">
              {book.reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {review.user.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">
                No reviews yet. Be the first to review this book!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
