import { Navigate, Outlet, useNavigate } from "react-router";
import { useUser } from "src/stores/userStore";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useUser((state) => state.user);

  if (user && allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/login" />;
}
