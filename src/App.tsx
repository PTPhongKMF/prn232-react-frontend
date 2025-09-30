import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";
import Slides from "src/pages/Slides/Slides";
import Exams from "src/pages/Exams/Exams";
import { useUser } from "src/stores/userStore";
import { Cookies } from "typescript-cookie";
import ProtectedRoute from "src/components/ProtectedRoute";

function App() {
  const { user, setuser } = useUser((state) => ({
    user: state.user,
    setuser: state.setUser,
  }));

  if (!user || !Cookies.get("token")) {
    setuser(null);
    Cookies.remove("token");
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="/slides" element={<Slides />} />
        <Route path="/exams" element={<Exams />} />

        <Route path="profile" element={<Profile />} />

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;
