import type { ReactNode } from "react";
import {
  BookOpen,
  Camera,
  Cloud,
  Coffee,
  Database,
  Gamepad2,
  GitBranch,
  Layers,
  Music,
  Plane,
  Server,
  Terminal,
} from "lucide-react";

export const ABOUT_ICON_OPTIONS = [
  { key: "cloud", label: "Cloud" },
  { key: "server", label: "Server" },
  { key: "git-branch", label: "Git Branch" },
  { key: "terminal", label: "Terminal" },
  { key: "book-open", label: "Book" },
  { key: "coffee", label: "Coffee" },
  { key: "gamepad-2", label: "Gamepad" },
  { key: "music", label: "Music" },
  { key: "plane", label: "Plane" },
  { key: "camera", label: "Camera" },
  { key: "layers", label: "Layers" },
  { key: "database", label: "Database" },
] as const;

export type AboutIconKey = (typeof ABOUT_ICON_OPTIONS)[number]["key"];

const ICON_MAP: Record<string, ReactNode> = {
  cloud: <Cloud size={16} />,
  server: <Server size={16} />,
  "git-branch": <GitBranch size={16} />,
  terminal: <Terminal size={20} />,
  "book-open": <BookOpen size={20} />,
  coffee: <Coffee size={20} />,
  "gamepad-2": <Gamepad2 size={20} />,
  music: <Music size={20} />,
  plane: <Plane size={20} />,
  camera: <Camera size={20} />,
  layers: <Layers size={20} />,
  database: <Database size={20} />,
};

export function getAboutIcon(key: string, size = 16): ReactNode {
  const icons: Record<string, (s: number) => ReactNode> = {
    cloud: (s) => <Cloud size={s} />,
    server: (s) => <Server size={s} />,
    "git-branch": (s) => <GitBranch size={s} />,
    terminal: (s) => <Terminal size={s} />,
    "book-open": (s) => <BookOpen size={s} />,
    coffee: (s) => <Coffee size={s} />,
    "gamepad-2": (s) => <Gamepad2 size={s} />,
    music: (s) => <Music size={s} />,
    plane: (s) => <Plane size={s} />,
    camera: (s) => <Camera size={s} />,
    layers: (s) => <Layers size={s} />,
    database: (s) => <Database size={s} />,
  };
  const render = icons[key];
  if (render) return render(size);
  return ICON_MAP.cloud ?? <Cloud size={size} />;
}
