import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";
import Upload from "src/pages/Upload";
import Slides from "src/pages/Slides";
import Explore from "src/pages/Explore";
import Payment from "src/pages/Payment";
import MyLibrary from "src/pages/MyLibrary";
import PaymentMethodsAdmin from "./pages/PaymentMethodsAdmin";

function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/payment-methods" element={<PaymentMethodsAdmin />} />
        <Route path="upload" element={<Upload />} />
        <Route path="slides/user/:userId" element={<Slides />} />
        <Route path="payment" element={<Payment />} />
        <Route path="my-library" element={<MyLibrary />} />

        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;

