import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";
import Slides from "src/pages/Slides";
import Exams from "src/pages/Exams/Exams";
import { useUser } from "src/stores/userStore";
import { Cookies } from "typescript-cookie";
import ProtectedRoute from "src/components/ProtectedRoute";
import QuestionBank from "src/pages/QuestionBank";
import Upload from "src/pages/Upload";
import Explore from "src/pages/Explore";
import Payment from "src/pages/Payment";
import MyLibrary from "src/pages/MyLibrary";
import PaymentMethodsAdmin from "./pages/PaymentMethodsAdmin";
import TagManagement from "src/pages/TagManagement";
import Create from "src/pages/Create";
import PurchaseHistory from "src/pages/PurchaseHistory";
import CreateExam from "src/pages/Exams/CreateExam";
import MyExams from "src/pages/Exams/MyExams";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const user = useUser((s) => s.user);
  const setUser = useUser((s) => s.setUser);

  // Debug log
  console.log("App component rendered, current user:", user);

  if ((!user && Cookies.get("token")) || (user && !Cookies.get("token"))) {
    setUser(null);
    Cookies.remove("token");
  }

  return (
      <>
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="slides/user/:userId" element={<Slides />} />
        <Route path="/slides" element={<Slides />} />
        <Route path="/exams" element={<Exams />} />

        <Route path="profile" element={<Profile />} />

        <Route element={<ProtectedRoute allowedRoles={["Teacher", "Admin"]} />}>
          <Route path="questionbank" element={<QuestionBank />} />
          <Route path="create" element={<Create />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="my-exams" element={<MyExams />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="admin/tag-management" element={<TagManagement />} />
        </Route>

        <Route path="admin" element={<Admin />} />
        <Route path="admin/payment-methods" element={<PaymentMethodsAdmin />} />
        <Route path="upload" element={<Upload />} />
        <Route path="payment" element={<Payment />} />
        <Route path="my-library" element={<MyLibrary />} />
        <Route path="purchase-history" element={<PurchaseHistory />}></Route>

        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
     <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
    />
  </>
  );
}

export default App;
