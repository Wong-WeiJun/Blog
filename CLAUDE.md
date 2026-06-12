# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based developer blog SPA with an admin dashboard, originally generated from Figma via "Make". It is a client-side rendered single-page application with no backend. All routing, auth, and data are handled in-memory with React state.

## Tech Stack

- **Build tool:** Vite 6 with `@vitejs/plugin-react`
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`), PostCSS
- **UI primitives:** Radix UI + shadcn/ui components in `src/app/components/ui/`
- **Icons:** Lucide React
- **Package manager:** pnpm (monorepo root via `pnpm-workspace.yaml`)

## Common Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Production build
pnpm build
```

## Architecture

### Routing

There is no router library. `App.tsx` uses a `useState<Page>` string union (`"home" | "post" | "admin" | "auth" | "settings" | "about" | "contact" | "404" | "projects"`) and conditionally renders the matching page component. Navigation callbacks are drilled as props through the component tree.

### Auth

Auth is entirely mocked. `AuthPages.tsx` contains hardcoded credentials:
- Admin: `hello@wong.dev` / `Password1!` (name: "Wong")
- User: `reader@gmail.com` / `Reader123!` (name: "Alex")

Successful login sets an `AuthUser` object in `App.tsx` state. The `user` prop is passed down to `Navbar` (for the user menu) and `AdminDashboard`. Admin users see an "Admin Dashboard" link in their dropdown.

### Styling Patterns

The project uses **two styling systems side by side**:

1. **Tailwind utility classes** — used for layout primitives (`flex`, `gap-4`, `max-w-7xl`, `mx-auto`, responsive prefixes like `md:flex`, `xl:block`).
2. **Inline `style` props** — used extensively for precise visual styling (colors, fonts, borders, gradients, hover effects). Many components define hover states via inline `onMouseEnter`/`onMouseLeave` handlers rather than Tailwind.

The blog pages use a custom dark theme with deep navy backgrounds (`#080a1a`, `#0d0f1e`) and brand purple accents (`#5046e5`). The shadcn/ui components in `src/app/components/ui/` follow the standard shadcn light/dark theme tokens defined in `src/styles/theme.css`.

Key CSS custom properties for shadcn components: `--primary: #030213`, `--destructive: #d4183d`, `--radius: 0.625rem`, `--input-background: #f3f3f5`.

### shadcn/ui Components

Located at `src/app/components/ui/`. Built on Radix UI primitives with `cva` (class-variance-authority) for variant APIs. The `cn()` utility in `src/app/components/ui/utils.ts` merges `clsx` + `tailwind-merge`. Many components follow the standard shadcn pattern (e.g. `Button` with `variant`, `size`, and `asChild` props).

### Assets

The Vite config includes a custom plugin `figmaAssetResolver()` that resolves `figma:asset/<filename>` imports to `src/assets/<filename>`. The project currently has no assets directory.

### Tailwind CSS v4 Configuration

Tailwind v4 uses `@import 'tailwindcss'` in `src/styles/tailwind.css` with `@source '../**/*.{js,ts,jsx,tsx}'` for content detection. There is no `tailwind.config.js`. Theme tokens are defined via CSS custom properties in `src/styles/theme.css` with `@theme inline`.

## File Organization

```
src/
  app/
    App.tsx              # Root component with page state + auth
    components/
      Navbar.tsx         # Top nav with search, user menu, mobile hamburger
      Hero.tsx           # Homepage hero section
      FeaturedPost.tsx   # Featured post preview on homepage
      PostGrid.tsx       # Blog post grid on homepage
      Sidebar.tsx        # Sidebar widgets (tags, popular posts)
      BlogPost.tsx       # Full blog article page (hardcoded content)
      Footer.tsx         # Site footer
      CodeBlock.tsx      # Syntax-highlighted code block component
      CommentSection.tsx # Mock comment section
      TableOfContents.tsx # Sticky TOC for blog posts
      ReadingProgress.tsx # Scroll progress bar
      AboutPage.tsx      # About page
      ContactPage.tsx    # Contact page
      ProjectsPage.tsx   # Projects page
      NotFoundPage.tsx   # 404 page
      auth/
        AuthPages.tsx    # Login/register/reset forms
        AccountSettings.tsx # Account settings page
      admin/
        AdminDashboard.tsx  # Admin layout with sidebar + topbar
        AdminSidebar.tsx    # Collapsible admin nav
        AdminTopBar.tsx     # Admin header with search
        OverviewView.tsx    # Admin overview dashboard
        PostsView.tsx       # Post management table
        PostEditor.tsx      # Full-screen markdown(ish) editor
        CommentsView.tsx    # Comment moderation
        AnalyticsView.tsx   # Analytics charts (Recharts)
        AdminProfileView.tsx # Profile view
        PlaceholderView.tsx # Placeholder for unimplemented views
      ui/                 # shadcn/ui components (Button, Card, Dialog, etc.)
      figma/
        ImageWithFallback.tsx # Image component with error fallback
  styles/
    index.css             # Entry point: imports fonts.css, tailwind.css, theme.css
    fonts.css             # @font-face declarations
    tailwind.css          # Tailwind v4 imports + @source directives
    theme.css             # CSS custom properties + @theme inline + base layer
  main.tsx                # React root creation + App mount
```

## Important Notes

- **No tests** — there is no test runner configured.
- **No linting** — ESLint/Prettier are not set up.
- **No TypeScript path mapping** — imports use relative paths or the `@/` alias (configured in Vite but rarely used in practice).
- **Hardcoded data** — blog posts, comments, analytics, and project listings are all static strings/objects embedded in components. There is no API layer or data fetching.
- **The React and Tailwind Vite plugins must not be removed** — the build requires both even if Tailwind classes are unused in some components.

## Conventions

- Use `'` for string literals in TypeScript/TSX (matches existing code).
- Component-local types/interfaces are defined in the same file.
- Hover effects are typically implemented via inline `onMouseEnter`/`onMouseLeave` style mutations, not Tailwind `hover:` classes.
- The blog dark theme (`#080a1a` background, `#fff` text, `#5046e5` accent) is separate from the shadcn light theme used by UI primitives.
