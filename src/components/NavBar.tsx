import { Link, useNavigate } from "react-router";
import {
  UserCircle,
  LogOut,
  LayoutDashboard,
  Shield,
  BookOpenText,
  BadgeQuestionMark,
  Upload,
  BookOpen,
  Search,
  ShoppingCart,
  CreditCard,
  BookText,
  Tag,
  Plus,
  History,
  ClipboardCheck,
} from "lucide-react";
import { useProfile } from "src/hooks/useAuth";
import { Cookies } from "typescript-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/stores/userStore";
import { useCart } from "src/stores/cartStore";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "src/components/libs/shadcn/hover-card";

export default function NavBar() {
  const { data: user, isSuccess } = useProfile();
  const setUser = useUser((state) => state.setUser);
  const { items } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove("token");
    setUser(null);
    queryClient.clear();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-amber-100/80 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto flex h-12 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-4 text-xl font-bold text-gray-800">
          <img src="/imgs/web-logo.png" className="size-10" />
          <span>Mathslide</span>
        </Link>

        <div className="flex items-center gap-12">
          {/* <Link
            to="/slides"
            className="flex justify-center items-center gap-1 font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            <BookMarked />
            Slides
          </Link> */}

          <Link
            to="/explore"
            className="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            <Search size={18} />
            Explore
          </Link>

          <Link
            to="/exams"
            className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
          >
            <BookOpenText />
            Exams
          </Link>

          {user?.role === "Teacher" && (
            <>
              <Link
                to="/create"
                className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <Plus />
                Create
              </Link>
              <Link
                to="/questionbank"
                className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <BadgeQuestionMark />
                Question Bank
              </Link>
              <Link
                to="/create-exam"
                className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <BookOpenText />
                Create Exam
              </Link>

              <Link
                to="/my-exams"
                className="flex justify-center items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <BookOpen />
                My Exams
              </Link>
            </>
          )}

          <div className="h-5 w-0.5 bg-black" />

          {user && (
            <Link
              to="/payment"
              className="relative flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              <ShoppingCart size={18} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {items.length}
                </span>
              )}
              Cart
            </Link>
          )}

          {isSuccess && user?.role === "Student" && (
            <Link
              to="/my-library"
              className="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
            >
              <BookText size={18} />
              My Library
            </Link>
          )}

          {isSuccess && user?.role === "Student" && (
            <>
              <Link
                to="/purchase-history"
                className="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <History size={18} />
                Purchase History
              </Link>

              <Link
                to="/exam-history"
                className="flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                <ClipboardCheck size={18} />
                Exam History
              </Link>
            </>
          )}

          {isSuccess && user ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                  <UserCircle className="text-blue-600" />
                  <span>Welcome, {user.name}!</span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56 p-0 bg-white border-0" align="end">
                <Link
                  to="/profile"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                {user.role === "Admin" && (
                  <>
                    <Link
                      to="/admin"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      User Management
                    </Link>
                    <Link
                      to="admin/tag-management"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Tag Management
                    </Link>
                    <Link
                      to="/admin/payment-methods"
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Link>
                  </>
                )}
                <Link
                  to="/upload"
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Link>
                <Link
                  to={`/slides/user/${user.id}`}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  My Slides
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </HoverCardContent>
            </HoverCard>
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
