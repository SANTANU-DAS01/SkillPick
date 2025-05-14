import { Link } from "react-router-dom"
import { BookOpen, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-indigo-400" />
              <span className="ml-2 text-xl font-bold">DiplomaBooks</span>
            </Link>
            <p className="mt-4 text-gray-300 text-sm">
              Your one-stop platform for all diploma books across 6 semesters in West Bengal.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/books" className="text-gray-300 hover:text-white text-sm">
                  Books
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books?category=Computer Science" className="text-gray-300 hover:text-white text-sm">
                  Computer Science
                </Link>
              </li>
              <li>
                <Link to="/books?category=Electrical" className="text-gray-300 hover:text-white text-sm">
                  Electrical
                </Link>
              </li>
              <li>
                <Link to="/books?category=Mechanical" className="text-gray-300 hover:text-white text-sm">
                  Mechanical
                </Link>
              </li>
              <li>
                <Link to="/books?category=Civil" className="text-gray-300 hover:text-white text-sm">
                  Civil
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@diplomabooks.com</span>
              </li>
              <li className="flex items-center text-gray-300 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start text-gray-300 text-sm">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>123 Education Street, Kolkata, West Bengal, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300 text-sm">
          <p>&copy; {new Date().getFullYear()} DiplomaBooks. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
