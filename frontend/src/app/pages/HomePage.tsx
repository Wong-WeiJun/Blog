import { Hero } from "../components/Hero";
import { FeaturedPost } from "../components/FeaturedPost";
import { PostGrid } from "../components/PostGrid";
import { Sidebar } from "../components/Sidebar";

export function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedPost />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            <PostGrid />
          </div>
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <Sidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
