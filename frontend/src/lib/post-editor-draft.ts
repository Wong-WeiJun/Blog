import type { PostResponse, PostStatus } from "@/client/types.gen";

const DRAFT_KEY = "blogsite:post-editor-draft";
const SESSION_KEY = "blogsite:admin-editor-session";

export interface PostEditorDraft {
  version: 1;
  postId: string | null;
  postSnapshot: PostResponse | null;
  createdPostSnapshot: PostResponse | null;
  title: string;
  slug: string;
  slugEdited: boolean;
  content: string;
  excerpt: string;
  status: PostStatus;
  featured: boolean;
  tags: string[];
  coverImage: string | null;
  date: string;
  savedAt: number;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

export function readPostEditorDraft(): PostEditorDraft | null {
  const draft = readJson<PostEditorDraft>(DRAFT_KEY);
  if (!draft || draft.version !== 1) return null;
  return draft;
}

export function writePostEditorDraft(draft: PostEditorDraft) {
  writeJson(DRAFT_KEY, draft);
}

export function clearPostEditorDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

export function hasAdminEditorSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "open";
}

export function markAdminEditorSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, "open");
  } catch {
    // ignore
  }
}

export function clearAdminEditorSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function clearPostEditorPersistence() {
  clearPostEditorDraft();
  clearAdminEditorSession();
}
