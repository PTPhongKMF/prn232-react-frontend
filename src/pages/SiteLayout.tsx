import { Outlet } from "react-router";
import Footer from "src/components/Footer";
import NavBar from "src/components/NavBar";

export default function SiteLayout() {
  return (
    <>
      <NavBar />

      <main className="size-full min-h-[100svh]">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
