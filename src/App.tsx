import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} /> 

        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;