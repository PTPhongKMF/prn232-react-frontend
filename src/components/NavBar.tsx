import { Link, useNavigate } from "react-router";
import { UserCircle, LogOut, LayoutDashboard, Shield, BookMarked, BookOpenText, BadgeQuestionMark } from "lucide-react";
import { useProfile } from "src/hooks/useAuth";
import { Cookies } from "typescript-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUser } from "src/stores/userStore";

export default function NavBar() {
  const { data: user, isSuccess } = useProfile();
  const setUser = useUser((state) => state.setUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
    queryClient.clear();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-amber-50/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-4 text-xl font-bold text-gray-800">
          <img src="/imgs/web-logo.png" className="size-10" />
          <span>Mathslide</span>
        </Link>

        <div className="flex items-center gap-12">
          <Link
            to="/slides"
            className="flex justify-center items-center gap-1 font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            <BookMarked />
            Slides
          </Link>
          <Link
            to="/exams"
            className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            <BookOpenText />
            Exams
          </Link>

          {user?.role === "Teacher" && (
            <Link
              to="/questionbank"
              className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              <BadgeQuestionMark />
              Question Bank
            </Link>
          )}

          <div className="h-5 w-0.5 bg-black" />

          {isSuccess && user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer"
              >
                <UserCircle className="text-blue-600" />
                <span>Welcome, {user.name}!</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                    {user.role === "Admin" && (
                      <Link
                        to="/admin"
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-gray-600 transition-colors hover:text-blue-600">
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
