import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./context/AuthContext"
import PrivateRoute from "./components/routing/PrivateRoute"
import AdminRoute from "./components/routing/AdminRoute"

// Layouts
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"

// Public Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import BookDetails from "./pages/BookDetails"
import AllBooks from "./pages/AllBooks"
import About from "./pages/About"
import Contact from "./pages/Contact"

// Private Pages
import Profile from "./pages/Profile"
import MyBooks from "./pages/MyBooks"

// Admin/Instructor Pages
import ManageBooks from "./pages/admin/ManageBooks"
import AddBook from "./pages/admin/AddBook"
import EditBook from "./pages/admin/EditBook"
import ManageUsers from "./pages/admin/ManageUsers"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="books" element={<AllBooks />} />
            <Route path="books/:id" element={<BookDetails />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-books" element={<MyBooks />} />
          </Route>

          {/* Admin/Instructor Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <DashboardLayout isAdmin={true} />
              </AdminRoute>
            }
          >
            <Route index element={<ManageUsers />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="books/add" element={<AddBook />} />
            <Route path="books/edit/:id" element={<EditBook />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
