import { Link } from "react-router";

export default function NavBar() {
  return (
    <nav className="flex fixed z-50 bg-yellow-600 w-full gap-10 justify-center items-center">
      <p>test1</p>
      <p>test2</p>
      <p>test3</p>
      <Link to="/login">Đăng nhập</Link>
    </nav>
  );
}
