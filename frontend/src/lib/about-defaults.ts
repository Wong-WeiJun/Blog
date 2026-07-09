import type { SiteAboutResponse } from "@/client/types.gen";
import { BRAND_NAME } from "./constants";

export const DEFAULT_ABOUT_PROFILE: SiteAboutResponse = {
  homepage_tagline: "Building cool things in the cloud",
  homepage_headline: "Cloud Engineer",
  homepage_headline_accent: "in progress.",
  homepage_bio:
    "Building resilient infrastructure, automating deployments, and documenting the journey — one cloud pattern at a time.",
  hero_subtitle: "Cloud Engineer in Progress · SRE Aspirant",
  hero_bio:
    "A developer blog chronicling cloud infrastructure, DevOps practices, and the hard-won lessons learned along the way.",
  open_to_work: true,
  resume_url: "/Resume.pdf",
  github_url: "https://github.com/Wong-WeiJun",
  linkedin_url: "https://www.linkedin.com/in/wei-jun-wong-507069357/",
  about_paragraphs: [
    "Hi there! This blog is a personal sandbox for documenting cloud infrastructure, DevOps practices, and software engineering patterns. Every post here started as a real problem faced in a project or a gap in documentation I wished existed.",
    "The focus is on practical, production-ready approaches — not just theory. From Terraform modules and CI/CD pipelines to container orchestration and monitoring, the goal is to share what actually works.",
    "New posts go up whenever there's something worth documenting. Subscribe via RSS or check back periodically for updates.",
  ],
  pull_quote:
    "The best infrastructure is the kind you forget is there until the day it quietly saves you at 2 AM.",
  pull_quote_attribution: "engineer-in-progress",
  location: "Planet Earth",
  availability_text: "Always learning",
  cta_heading: "Let's work together",
  cta_subtext: "Interested in cloud engineering, SRE, or infrastructure roles.",
  skill_groups: [
    {
      category: "Cloud",
      icon: "cloud",
      color: "#f97316",
      skills: [
        { name: "AWS", level: 85 },
        { name: "GCP", level: 55 },
        { name: "Terraform", level: 78 },
        { name: "CloudFormation", level: 60 },
      ],
    },
    {
      category: "Backend",
      icon: "server",
      color: "#3b82f6",
      skills: [
        { name: "Python", level: 88 },
        { name: "FastAPI", level: 82 },
        { name: "PostgreSQL", level: 75 },
        { name: "Redis", level: 65 },
      ],
    },
    {
      category: "DevOps",
      icon: "git-branch",
      color: "#22c55e",
      skills: [
        { name: "Docker", level: 90 },
        { name: "Kubernetes", level: 70 },
        { name: "GitHub Actions", level: 85 },
        { name: "Prometheus", level: 68 },
        { name: "Grafana", level: 60 },
      ],
    },
  ],
  certifications: [
    {
      name: "AWS Solutions Architect Associate",
      issuer: "Amazon Web Services",
      date: "2025",
      badge: "SAA-C03",
      color: "#f97316",
      abbr: "SAA",
    },
    {
      name: "IBM Data Engineering Professional",
      issuer: "IBM / Coursera",
      date: "2024",
      badge: "DE-PRO",
      color: "#3b82f6",
      abbr: "IBM",
    },
  ],
  education: [
    {
      institution: "Your University",
      degree: "B.S. (Hons) Computer Science",
      minor: "Minor in Statistics",
      start: "Aug 2022",
      end: "May 2026",
      current: true,
      gpa: "—",
      highlights: ["Add your achievements here"],
    },
    {
      institution: "Your Previous School",
      degree: "Diploma / A-Levels / etc.",
      minor: "",
      start: "Apr 2019",
      end: "Mar 2022",
      current: false,
      gpa: "—",
      highlights: ["Add your highlights here"],
    },
  ],
  interests: [
    { icon: "terminal", label: "Homelab tinkering", color: "#5046e5" },
    { icon: "book-open", label: "Technical writing", color: "#06b6d4" },
    { icon: "coffee", label: "Specialty coffee", color: "#f97316" },
    { icon: "gamepad-2", label: "Indie games", color: "#22c55e" },
    { icon: "music", label: "Lo-fi playlists", color: "#8b5cf6" },
    { icon: "plane", label: "Budget travel", color: "#f59e0b" },
    { icon: "camera", label: "Street photography", color: "#ec4899" },
    { icon: "layers", label: "Open source", color: "#4ade80" },
    { icon: "database", label: "Data hoarding", color: "#a5b4fc" },
  ],
  owner: {
    full_name: BRAND_NAME,
    avatar_url: null,
  },
  updated_at: new Date().toISOString(),
};

export function getDisplayName(profile: SiteAboutResponse): string {
  return profile.owner.full_name || BRAND_NAME;
}
