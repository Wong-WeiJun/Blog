# Developer Blog & Admin Dashboard

A modern, single-page developer blog with a full-featured admin dashboard. Built with Vite, React 18, Tailwind CSS v4, and shadcn/ui. Originally designed in Figma and generated via "Make".

---

## Overview

This is a client-side rendered React SPA with a sleek dark-themed blog on the public side and a powerful admin dashboard on the private side. There is no backend—all data is currently hardcoded and mocked in-memory.

---

## Tech Stack

| Area | Technologies |
|------|-------------|
| **Build Tool** | Vite 6 |
| **Framework** | React 18, TypeScript |
| **Styling** | Tailwind CSS v4, PostCSS |
| **UI Components** | Radix UI, shadcn/ui |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Markdown** | react-markdown, remark-gfm, highlight.js |
| **Testing** | Vitest, @testing-library/react |
| **Auth** | Mocked in-memory (no real backend) |

---

## Features

### Public Blog
- **Homepage**: Hero section, featured post, and a responsive post grid.
- **Blog Posts**: Full article view with a sticky table of contents, reading progress bar, and syntax-highlighted code blocks.
- **Comments**: A mock comment section on blog posts.
- **Pages**: About, Contact, Projects, and a 404 page.
- **Dark Theme**: Custom deep navy aesthetic (`#080a1a`, `#0d0f1e`) with brand purple accents (`#5046e5`).
- **Animations**: Smooth scroll and interactive hover effects.

### Admin Dashboard
- **Overview**: High-level dashboard with key metrics and charts.
- **Analytics**: Data visualization using Recharts.
- **Posts Management**: View, search, and filter posts in a data table.
- **Post Editor**: A full-screen editor for creating and updating posts.
- **Comment Moderation**: Review and manage blog comments.
- **Profile**: Admin profile management.
- **Responsive Sidebar**: Collapsible navigation for the admin area.

### Authentication
- **Login / Register / Password Reset**: Fully functional forms.
- **Role-based Views**: Admin users see the "Admin Dashboard" link in the user menu.

---

## Getting Started

### 1. Install dependencies
```bash
pnpm install
```

### 2. Start the dev server
```bash
pnpm dev
```

### 3. Open the app
The dev server will start at `http://localhost:5173`.

---

## Interacting with the Application

### Public Pages
- **Home**: `/` — Browse the hero, featured post, and post grid.
- **Blog Post**: Click "Read More" on any post card to view the full article with a table of contents and reading progress bar.
- **About, Contact, Projects**: Access these via the footer or navigation links.

### Admin Dashboard
Log in with the credentials below and click "Admin Dashboard" in the user dropdown menu.

### Mock Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `hello@wong.dev` | `Password1!` |
| **User** | `reader@gmail.com` | `Reader123!` |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Root component & state
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Top nav with search & user menu
│   │   │   ├── Hero.tsx         # Homepage hero
│   │   │   ├── FeaturedPost.tsx # Featured post preview
│   │   │   ├── PostGrid.tsx     # Blog post grid
│   │   │   ├── BlogPost.tsx     # Full article page
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── ReadingProgress.tsx
│   │   │   ├── CodeBlock.tsx    # Syntax highlighting
│   │   │   ├── CommentSection.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── AuthPages.tsx    # Login, Register, Reset forms
│   │   │   └── AccountSettings.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── OverviewView.tsx
│   │       ├── PostsView.tsx
│   │       ├── PostEditor.tsx
│   │       ├── AnalyticsView.tsx
│   │       └── ...
│   ├── styles/
│   │   ├── index.css            # Entry point
│   │   ├── tailwind.css         # Tailwind v4 imports
│   │   └── theme.css            # CSS custom properties
│   ├── components/ui/           # shadcn/ui primitives
│   └── main.tsx
├── index.html
└── vite.config.ts
```

---

## Roadmap / What's Next

- [ ] Connect a real backend API (FastAPI/PostgreSQL suggested).
- [ ] Add real authentication and user management.
- [ ] Dynamic routing via `react-router`.
- [ ] Content Management System (CMS) features in the admin panel.

---

## Credits

- Design originally generated from Figma via **Make**.
- UI components powered by [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/).
