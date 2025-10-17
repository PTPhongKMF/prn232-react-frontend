import { Route, Routes } from "react-router";
import SiteLayout from "./pages/SiteLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Test from "src/pages/Test";
import Profile from "src/pages/Profile";
import Admin from "src/pages/Admin";
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
import Slides from "src/pages/Slides";
<<<<<<< HEAD
import CreateExam from "src/pages/Exams/CreateExam";
import MyExams from "src/pages/Exams/MyExams";
=======
>>>>>>> parent of fa6a721 (Merge pull request #6 from PTPhongKMF/main)

function App() {
  const user = useUser((s) => s.user);
  const setUser = useUser((s) => s.setUser);

  if ((!user && Cookies.get("token")) || (user && !Cookies.get("token"))) {
    setUser(null);
    Cookies.remove("token");
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/exams" element={<Exams />} />

        <Route path="profile" element={<Profile />} />

        <Route element={<ProtectedRoute allowedRoles={["Teacher", "Admin"]} />}>
<<<<<<< HEAD
          <Route path="questionbank" element={<QuestionBank />} />       
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Teacher"]} />}>
          <Route path="/exams/create" element={<CreateExam />} />
          <Route path="/my-exams" element={<MyExams />} />
=======
          <Route path="questionbank" element={<QuestionBank />} />
>>>>>>> parent of fa6a721 (Merge pull request #6 from PTPhongKMF/main)
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="admin/tag-management" element={<TagManagement />} />
        </Route>

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
