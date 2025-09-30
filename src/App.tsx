import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";
import AdminRoute from "./pages/AdminRoute";

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />

        {/* Admin Route */}
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;