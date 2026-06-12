import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeaturedPost } from "./components/FeaturedPost";
import { PostGrid } from "./components/PostGrid";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { BlogPost } from "./components/BlogPost";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AuthPages, type UserRole } from "./components/auth/AuthPages";
import { AccountSettings } from "./components/auth/AccountSettings";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { ProjectsPage } from "./components/ProjectsPage";
import { TextPage } from "./components/TextPage";
import { TagArchivePage } from "./components/TagArchivePage";

type Page = "home" | "post" | "admin" | "auth" | "settings" | "about" | "contact" | "404" | "projects" | "legal" | "tag";

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
}

const USER_INFO: Record<UserRole, AuthUser> = {
  admin: { role: "admin", name: "Wong",  email: "hello@wong.dev"   },
  user:  { role: "user",  name: "Alex",  email: "reader@gmail.com" },
};

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [tag, setTag] = useState<string>("");
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleLogin = (role: UserRole) => {
    setUser(USER_INFO[role]);
    if (role === "admin") setPage("admin");
    else setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  const openHome = () => { setPage("home"); window.scrollTo({ top: 0 }); };
  const openPost = () => { setPage("post"); window.scrollTo({ top: 0 }); };
  const openAbout = () => { setPage("about"); window.scrollTo({ top: 0 }); };
  const openProjects = () => { setPage("projects"); window.scrollTo({ top: 0 }); };
  const openContact = () => { setPage("contact"); window.scrollTo({ top: 0 }); };

  if (page === "admin") {
    return <AdminDashboard user={user} onExit={openHome} onLogout={handleLogout} />;
  }

  if (page === "auth") {
    return <AuthPages onBack={openHome} onLoginSuccess={handleLogin} />;
  }

  if (page === "settings") {
    return <AccountSettings user={user} onBack={openHome} onLogout={handleLogout} />;
  }

  if (page === "about") {
    return <AboutPage onBack={openHome} onOpenContact={openContact} />;
  }

  if (page === "projects") {
    return <ProjectsPage onBack={openHome} onOpenContact={openContact} />;
  }

  if (page === "contact") {
    return <ContactPage onBack={openHome} />;
  }

  if (page === "legal") {
    return <TextPage onBack={openHome} />;
  }

  if (page === "tag") {
    return <TagArchivePage tag={tag} onBack={openHome} onOpenPost={openPost} />;
  }

  if (page === "404") {
    return <NotFoundPage onGoHome={openHome} onBrowsePosts={openHome} />;
  }

  const navigateToTag = (t: string) => {
    setTag(t);
    setPage("tag");
    window.scrollTo({ top: 0 });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 40%, #060818 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* MARKER-MAKE-KIT-INVOKED */}
      {/* MARKER-MAKE-KIT-DISCOVERY-READ */}
      <Navbar
        user={user}
        onOpenHome={openHome}
        onOpenPost={openPost}
        onOpenAdmin={() => setPage("admin")}
        onOpenAuth={() => setPage("auth")}
        onOpenSettings={() => setPage("settings")}
        onOpenAbout={openAbout}
        onOpenProjects={openProjects}
        onOpenContact={openContact}
        onOpen404={() => setPage("404")}
        onLogout={handleLogout}
      />

      {page === "home" && (
        <main>
          <Hero onReadBlog={openPost} onOpenAbout={openAbout} />
          <FeaturedPost onReadMore={openPost} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 min-w-0">
                <PostGrid onOpenPost={openPost} />
              </div>
              <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
                <Sidebar onSelectTag={navigateToTag} onOpenPost={openPost} />
              </div>
            </div>
          </div>
        </main>
      )}

      {page === "post" && (
        <main>
          <BlogPost onBack={openHome} onTagClick={navigateToTag} />
        </main>
      )}

      <Footer
        onOpenHome={openHome}
        onOpenPost={openPost}
        onOpenProjects={openProjects}
        onOpenAbout={openAbout}
        onOpenContact={openContact}
        onOpen404={() => setPage("404")}
        onOpenLegal={() => setPage("legal")}
      />
    </div>
  );
}
