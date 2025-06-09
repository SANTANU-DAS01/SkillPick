# Learning Management System (LMS)

A full-stack Learning Management System application with user authentication, book management, file uploads, and role-based access control.

## Project Structure

The project is divided into two main parts:

### Backend (Node.js/Express)

The backend is a RESTful API built with Node.js and Express, providing endpoints for authentication, user management, book management, and file operations.

### Frontend (React/Vite)

The frontend is a React application built with Vite, providing a user interface for interacting with the backend API. It includes public pages, authenticated user pages, and admin/instructor pages.

## Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Cloudinary** - Cloud storage for files

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **TailwindCSS** - CSS framework
- **React Hot Toast** - Notifications

## Features

- **User Authentication**: Register, login, and profile management
- **Role-Based Access Control**: Different access levels for public users, authenticated users, instructors, and admins
- **Book Management**: Browse, search, add, edit, and delete books
- **File Management**: Upload, download, and manage files
- **User Dashboard**: Manage profile and access personal books
- **Admin Dashboard**: Manage users, books, and system settings

## API Routes

### Public Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Authenticated User Routes
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `PUT /api/users/:id/password` - Change password
- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload a file
- `GET /api/files/download/:fileId` - Download a file
- `POST /api/books/:id/addBookToUser` - Add book to user's collection
- `POST /api/books/:id/reviews` - Add a review to a book

### Admin Routes
- `GET /api/users` - Get all users
- `POST /api/books` - Create a book
- `PUT /api/books/:id` - Update a book
- `DELETE /api/books/:id` - Delete a book

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Start the server:
   ```
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Usage

### User Roles
- **Public**: Can view public pages, register, login, and browse books
- **Authenticated User**: Can access their dashboard, profile, and personal books
- **Instructor**: Can create, edit, and delete their own books
- **Admin**: Can manage all users and books in the system

### Frontend Routes
- **Public Routes**:
  - `/` - Home page
  - `/login` - Login page
  - `/register` - Registration page
  - `/books` - All books
  - `/books/:id` - Book details
  - `/about` - About page
  - `/contact` - Contact page

- **Authenticated User Routes**:
  - `/dashboard` - User dashboard
  - `/dashboard/profile` - User profile
  - `/dashboard/my-books` - User's books

- **Admin/Instructor Routes**:
  - `/admin` - Admin dashboard
  - `/admin/books` - Manage books
  - `/admin/books/add` - Add a book
  - `/admin/books/edit/:id` - Edit a book
  - `/admin/users` - Manage users

## License

This project is licensed under the ISC License.
