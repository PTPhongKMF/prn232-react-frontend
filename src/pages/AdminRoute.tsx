import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "src/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (isError || user?.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
