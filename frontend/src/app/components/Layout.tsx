import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export function Layout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 40%, #060818 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
