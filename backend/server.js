const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/users', require('./routes/userRoutes.js'));
app.use('/api/books', require('./routes/bookRoutes.js'));
app.use('/api/files', require('./routes/fileRoutes.js'));

// Root route
app.get('/', (req, res) => {
  res.send('LMS API is running');
});

// Route to list all routes organized by roles
app.get('/api/routes', (req, res) => {
  const routes = {
    public: [
      { method: 'POST', path: '/api/auth/register' },
      { method: 'POST', path: '/api/auth/login' }
    ],
    authenticated: [
      { method: 'GET', path: '/api/auth/me' },
      { method: 'POST', path: '/api/auth/logout' },
      { method: 'GET', path: '/api/users/:id' },
      { method: 'PUT', path: '/api/users/:id' },
      { method: 'PUT', path: '/api/users/:id/password' },
      { method: 'GET', path: '/api/files' },
      { method: 'GET', path: '/api/files/:id' },
      { method: 'PUT', path: '/api/files/:id' },
      { method: 'DELETE', path: '/api/files/:id' },
      { method: 'POST', path: '/api/files/upload' },
      { method: 'GET', path: '/api/files/download/:fileId' },
      { method: 'POST', path: '/api/books/:id/addBookToUser' },
      { method: 'POST', path: '/api/books/:id/reviews' }
    ],
    admin: [
      { method: 'GET', path: '/api/users' },
      { method: 'POST', path: '/api/books' },
      { method: 'PUT', path: '/api/books/:id' },
      { method: 'DELETE', path: '/api/books/:id' }
    ],
    instructor: [
      { method: 'POST', path: '/api/books' },
      { method: 'PUT', path: '/api/books/:id' },
      { method: 'DELETE', path: '/api/books/:id' }
    ]
  };
  res.json(routes);
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error:', err); // <--- Add this line to log errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error'
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});