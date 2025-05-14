import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:5000", // Change this to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      // Don't redirect with window.location to prevent page reload
      // The error will be handled by the calling code
    }
    return Promise.reject(error)
  },
)

export default api
