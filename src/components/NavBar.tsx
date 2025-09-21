import { Link } from "react-router-dom"; // Use react-router-dom for web projects
import { Plane } from "lucide-react"; // A fun icon for the brand

export default function NavBar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-amber-50/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Left Side: Brand/Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Plane className="text-blue-600" />
          <span>Mathslide</span>
        </Link>

        {/* Right Side: Navigation Links and Login Button */}
        <div className="flex items-center gap-6">
          <Link
            to="/features"
            className="hidden font-medium text-gray-600 transition-colors hover:text-blue-600 md:block"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="hidden font-medium text-gray-600 transition-colors hover:text-blue-600 md:block"
          >
            Pricing
          </Link>
          <Link
            to="/contact"
            className="hidden font-medium text-gray-600 transition-colors hover:text-blue-600 md:block"
          >
            Contact
          </Link>

          {/* Login link styled as a button */}
          <Link
            to="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-transform active:scale-95 hover:scale-95 hover:shadow-sm"
          >
            Đăng nhập
          </Link>
        </div>
      </nav>
    </header>
  );
}