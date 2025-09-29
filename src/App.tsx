import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} /> 
      </Route>
    </Routes>
  );
}

export default App;