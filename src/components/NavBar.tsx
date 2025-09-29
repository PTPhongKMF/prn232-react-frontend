import { Link } from "react-router";
import { Plane } from "lucide-react";

type User = {
  name: string;
};

const useAuth = () => {
  return { user: null as User | null };
};

export default function NavBar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-amber-50/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-800"
        >
          <Plane className="text-blue-600" />
          <span>Mathslide</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* This part will no longer cause an error */}
              <span className="font-semibold text-gray-700">
                Welcome, {user.name}!
              </span>
              <button className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow-md transition-transform active:scale-95 hover:scale-95 hover:shadow-sm">
                Logout
              </button>
            </>
          ) : (
            <>
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
              <Link
                to="/login"
                className="font-semibold text-gray-600 transition-colors hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-transform active:scale-95 hover:scale-95 hover:shadow-sm"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
