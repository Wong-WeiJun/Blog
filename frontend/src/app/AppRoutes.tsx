import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import { AuthProvider } from "../lib/auth-context";
import { useAuth } from "../lib/auth-context";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { TagArchivePage } from "./components/TagArchivePage";
import { NotFoundPage } from "./components/NotFoundPage";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { ProjectsPage } from "./components/ProjectsPage";
import { AuthPages } from "./components/auth/AuthPages";
import { AccountSettings } from "./components/auth/AccountSettings";
import { TextPage } from "./components/TextPage";
import { AdminDashboard } from "./components/admin/AdminDashboard";

function RequireAdmin() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="tag/:tag" element={<TagArchivePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="legal" element={<TextPage />} />
            <Route path="404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
          <Route path="auth" element={<AuthPages />} />
          <Route path="settings" element={<AccountSettings />} />
          <Route element={<RequireAdmin />}>
            <Route path="admin/*" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
