import type { ReactNode, RefObject, DragEvent } from "react";
import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft, Bold, Italic, Code, Heading2, Heading3, Link2,
  ImagePlus, Quote, Save, Send, Eye, X, Upload, Globe,
  Calendar, Loader2, Check, AlertCircle,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postsCreatePost, postsUpdatePost, postsPublishPost } from "@/client/sdk.gen";
import type { PostResponse, PostStatus } from "@/client/types.gen";
import { BRAND_DOMAIN } from "../../../lib/constants";
import useCustomToast from "../../../hooks/useCustomToast";

/* ───────────────────────────── types ───────────────────────────── */

interface Props {
  onBack: () => void;
  onPublished?: () => void;
  post?: PostResponse | null; // null/undefined = create mode
}

/* ───────────────────────── toolbar button ───────────────────────── */

function ToolBtn({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "6px", border: "none", background: active ? "rgba(80,70,229,0.22)" : "transparent", color: active ? "#a5b4fc" : "rgba(255,255,255,0.55)", cursor: "pointer", transition: "background 0.12s, color 0.12s", flexShrink: 0 }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
    >
      {icon}
    </button>
  );
}

/* ──────────────────────── rich-text toolbar ─────────────────────── */

function insertWrap(ref: RefObject<HTMLTextAreaElement | null>, setValue: (v: string) => void, wrap: string, block?: string) {
  const el = ref.current;
  if (!el) return;
  const { selectionStart: s, selectionEnd: e, value } = el;
  const sel = value.slice(s, e);
  const replacement = block ? `${block}${sel || "text"}` : `${wrap}${sel || "text"}${wrap}`;
  setValue(value.slice(0, s) + replacement + value.slice(e));
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(s + (block ? block.length : wrap.length), s + (block ? block.length : wrap.length) + (sel || "text").length);
  });
}

function Toolbar({ textareaRef, setValue }: { textareaRef: RefObject<HTMLTextAreaElement | null>; setValue: (v: string) => void }) {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const toggle = (key: string, wrap: string, block?: string) => {
    insertWrap(textareaRef, setValue, wrap, block);
    setActiveFormats((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };
  const tools = [
    { key: "bold",   icon: <Bold size={14} />,      label: "Bold",         action: () => toggle("bold", "**") },
    { key: "italic", icon: <Italic size={14} />,    label: "Italic",       action: () => toggle("italic", "_") },
    { key: "code",   icon: <Code size={14} />,      label: "Inline code",  action: () => toggle("code", "`") },
    null,
    { key: "h2",     icon: <Heading2 size={14} />,  label: "Heading 2",    action: () => insertWrap(textareaRef, setValue, "", "## ") },
    { key: "h3",     icon: <Heading3 size={14} />,  label: "Heading 3",    action: () => insertWrap(textareaRef, setValue, "", "### ") },
    { key: "quote",  icon: <Quote size={14} />,     label: "Blockquote",   action: () => insertWrap(textareaRef, setValue, "", "> ") },
    null,
    { key: "link",   icon: <Link2 size={14} />,     label: "Insert link",  action: () => insertWrap(textareaRef, setValue, "", "[text](url)") },
    { key: "image",  icon: <ImagePlus size={14} />, label: "Insert image", action: () => insertWrap(textareaRef, setValue, "", "![alt](url)") },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "2px", padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap" }}>
      {tools.map((t, i) =>
        t === null ? (
          <div key={`sep-${i}`} style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
        ) : (
          <ToolBtn key={t.key} icon={t.icon} label={t.label} active={activeFormats.has(t.key)} onClick={t.action} />
        )
      )}
      <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      <ToolBtn
        icon={<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>{"</>"}</span>}
        label="Code block"
        onClick={() => {
          const el = textareaRef.current;
          if (!el) return;
          const { selectionStart: s, value } = el;
          setValue(value.slice(0, s) + "\n```\ncode here\n```\n" + value.slice(s));
        }}
      />
    </div>
  );
}

/* ─────────────────────────── cover upload (S3) ───────────────────────── */

type UploadStatus = "idle" | "requesting" | "uploading" | "done" | "error";

/**
 * Uploads a cover image directly to S3 via a presigned POST URL.
 *
 * Flow:
 *   1. Ask backend for a presigned POST URL (POST /api/v1/uploads/cover-image-url)
 *   2. PUT the file straight to S3 using the presigned fields
 *   3. Call onChange(publicUrl) so the editor can include it in the post body
 */
async function uploadToS3(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  // Step 1 — get presigned URL from backend
  const token = localStorage.getItem("access_token");
  const presignRes = await fetch("/api/v1/uploads/cover-image-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });
  if (!presignRes.ok) {
    const err = await presignRes.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Failed to get upload URL");
  }
  const { url, fields, public_url } = await presignRes.json() as {
    url: string; fields: Record<string, string>; public_url: string;
  };

  // Step 2 — POST directly to S3
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    // fields must come before the file (S3 requirement)
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      // S3 presigned POST returns 204 No Content on success
      if (xhr.status === 204 || xhr.status === 200) resolve(public_url);
      else reject(new Error(`S3 upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during S3 upload"));
    xhr.open("POST", url);
    xhr.send(fd);
  });
}

function CoverUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [dragging, setDragging]   = useState(false);
  const [status, setStatus]       = useState<UploadStatus>("idle");
  const [progress, setProgress]   = useState(0);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file (JPEG, PNG, WebP, etc.)");
      setStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image must be under 10 MB.");
      setStatus("error");
      return;
    }

    // Show local preview immediately while uploading
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setStatus("requesting");
    setProgress(0);
    setErrorMsg(null);

    try {
      setStatus("uploading");
      const publicUrl = await uploadToS3(file, setProgress);
      onChange(publicUrl);
      setStatus("done");
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  }, [onChange]);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleRemove = () => {
    onChange(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg(null);
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displaySrc = value ?? localPreview;
  const isUploading = status === "requesting" || status === "uploading";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Cover Image</p>

      {displaySrc ? (
        <div style={{ position: "relative", borderRadius: "9px", overflow: "hidden", aspectRatio: "16/9" }}>
          <img src={displaySrc} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isUploading ? "brightness(0.5)" : "none", transition: "filter 0.2s" }} />

          {/* Upload progress overlay */}
          {isUploading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <Loader2 size={22} color="#fff" style={{ animation: "spin 0.8s linear infinite" }} />
              <div style={{ width: "60%", height: "4px", background: "rgba(255,255,255,0.2)", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "#5046e5", borderRadius: "999px", transition: "width 0.2s" }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>{progress}%</span>
            </div>
          )}

          {/* Done badge */}
          {status === "done" && (
            <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(74,222,128,0.9)", borderRadius: "6px", padding: "3px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
              <Check size={11} color="#fff" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, color: "#fff" }}>Uploaded</span>
            </div>
          )}

          {/* Remove button */}
          {!isUploading && (
            <button onClick={handleRemove} title="Remove cover image" style={{ position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.65)")}
            >
              <X size={13} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? "#5046e5" : "rgba(255,255,255,0.1)"}`, borderRadius: "9px", padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: isUploading ? "wait" : "pointer", background: dragging ? "rgba(80,70,229,0.06)" : "transparent", transition: "all 0.15s", textAlign: "center" }}
        >
          {isUploading ? (
            <Loader2 size={22} color="rgba(165,180,252,0.7)" style={{ animation: "spin 0.8s linear infinite" }} />
          ) : (
            <Upload size={22} color="rgba(255,255,255,0.25)" />
          )}
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", margin: "0 0 2px" }}>
              {isUploading ? "Uploading to S3…" : (<>Drag & drop or <span style={{ color: "#a5b4fc" }}>browse</span></>)}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>
              {isUploading ? `${progress}%` : "PNG, JPG, WebP · max 10 MB · 16:9 recommended"}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {status === "error" && errorMsg && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: "7px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "7px", padding: "9px 12px" }}>
          <AlertCircle size={13} color="#f87171" style={{ marginTop: "1px", flexShrink: 0 }} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "#f87171", margin: 0 }}>{errorMsg}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

/* ──────────────────────────── tags input ────────────────────────── */

const SUGGESTED_TAGS = ["AWS", "Terraform", "Docker", "Kubernetes", "CI/CD", "Linux", "Python", "GCP"];
const TAG_COLORS: Record<string, string> = {
  AWS: "#f97316", Terraform: "#8b5cf6", Docker: "#06b6d4",
  Kubernetes: "#5046e5", "CI/CD": "#22c55e", Linux: "#f59e0b",
  Python: "#ec4899", GCP: "#3b82f6",
};

function TagsInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("");
  const [showSugg, setShowSugg] = useState(false);
  const addTag = (t: string) => {
    const val = t.trim();
    if (val && !value.includes(val)) onChange([...value, val]);
    setInput(""); setShowSugg(false);
  };
  const removeTag = (t: string) => onChange(value.filter((x) => x !== t));
  const suggestions = SUGGESTED_TAGS.filter((s) => !value.includes(s) && s.toLowerCase().includes(input.toLowerCase()));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Tags</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {value.map((tag) => {
          const color = TAG_COLORS[tag] ?? "#6b7280";
          return (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: "6px", padding: "3px 8px" }}>
              {tag}
              <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color, padding: "0", display: "flex", opacity: 0.7, transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              ><X size={11} /></button>
            </span>
          );
        })}
      </div>
      <div style={{ position: "relative" }}>
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSugg(true); }}
          onFocus={() => setShowSugg(true)}
          onBlur={() => setTimeout(() => setShowSugg(false), 120)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(input); } }}
          placeholder="Add tag… (Enter to confirm)"
          style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
          onFocusCapture={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
          onBlurCapture={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
        />
        {showSugg && suggestions.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#0f1124", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
            {suggestions.map((s) => (
              <button key={s} onMouseDown={() => addTag(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(80,70,229,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >{s}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── publish panel ────────────────────────── */

function PublishPanel({ status, onStatusChange, date, onDateChange, featured, onFeaturedChange }: {
  status: PostStatus; onStatusChange: (s: PostStatus) => void;
  date: string; onDateChange: (d: string) => void;
  featured: boolean; onFeaturedChange: (f: boolean) => void;
}) {
  const Toggle = ({ on, onToggle, label, sublabel, color = "#5046e5" }: { on: boolean; onToggle: () => void; label: string; sublabel?: string; color?: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#fff", margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{sublabel}</p>}
      </div>
      <button onClick={onToggle} style={{ width: "40px", height: "22px", borderRadius: "999px", border: "none", cursor: "pointer", position: "relative", background: on ? color : "rgba(255,255,255,0.12)", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: "3px", left: on ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
      </button>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Publish Settings</p>
      <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", overflow: "hidden" }}>
        {(["draft", "published"] as const).map((s) => (
          <button key={s} onClick={() => onStatusChange(s)} style={{ flex: 1, padding: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.15s", background: status === s ? (s === "published" ? "rgba(74,222,128,0.18)" : "rgba(80,70,229,0.18)") : "transparent", color: status === s ? (s === "published" ? "#4ade80" : "#a5b4fc") : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status === s ? (s === "published" ? "#4ade80" : "#a5b4fc") : "rgba(255,255,255,0.2)", display: "inline-block" }} />
            {s === "draft" ? "Draft" : "Published"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "5px" }}>
          <Calendar size={12} />Publication date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", color: "#fff", outline: "none", boxSizing: "border-box", colorScheme: "dark" }}
        />
      </div>
      <Toggle on={featured} onToggle={() => onFeaturedChange(!featured)} label="Featured post" sublabel="Pin to homepage hero section" color="#f59e0b" />
    </div>
  );
}

/* ──────────────────────── SEO panel ────────────────────────── */

function SeoPanel({ title, excerpt, onExcerptChange }: { title: string; excerpt: string; onExcerptChange: (v: string) => void }) {
  const [metaTitle, setMetaTitle] = useState(title || "");
  const [titleEdited, setTitleEdited] = useState(false);
  const effectiveTitle = titleEdited ? metaTitle : (title || metaTitle);
  const titleLen = effectiveTitle.length;
  const descLen  = excerpt.length;
  const titleOk  = titleLen >= 30 && titleLen <= 60;
  const descOk   = descLen >= 70 && descLen <= 160;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>SEO</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Meta title</label>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: titleOk ? "#4ade80" : titleLen > 60 ? "#f87171" : "rgba(255,255,255,0.3)" }}>{titleLen}/60</span>
        </div>
        <input
          value={effectiveTitle}
          onChange={(e) => { setMetaTitle(e.target.value); setTitleEdited(true); }}
          maxLength={70}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${titleOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = titleOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)")}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Excerpt / meta description</label>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: descOk ? "#4ade80" : descLen > 160 ? "#f87171" : "rgba(255,255,255,0.3)" }}>{descLen}/160</span>
        </div>
        <textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          rows={3}
          maxLength={180}
          placeholder="A short description shown in search results and post cards…"
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${descOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box", resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = descOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)")}
        />
      </div>
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", overflow: "hidden" }}>
        <div style={{ height: "72px", background: "linear-gradient(135deg, #0d0f24, #130d28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(165,180,252,0.4)" }}>og:image preview</span>
        </div>
        <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.025)" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: "0 0 3px", display: "flex", alignItems: "center", gap: "4px" }}><Globe size={9} />{BRAND_DOMAIN}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", margin: "0 0 3px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{effectiveTitle || "Post title"}</p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{excerpt || "Excerpt will appear here…"}</p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── word count bar ────────────────────────── */

function WordCountBar({ content }: { content: string }) {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readMin = Math.max(1, Math.round(words / 200));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "10px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.15)" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>{words.toLocaleString()} words</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>{chars.toLocaleString()} chars</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(165,180,252,0.55)" }}>~{readMin} min read</span>
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>Markdown</span>
    </div>
  );
}

function SidebarSection({ children }: { children: ReactNode }) {
  return <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px" }}>{children}</div>;
}

/* ──────────────────── slug generator ───────────────────────────── */

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

/* ────────────────────────── main editor ────────────────────────── */

const PLACEHOLDER = `## Introduction\n\nStart writing your post here. This editor supports **Markdown** syntax.\n\nUse the toolbar above to insert formatting, headings, code blocks, and links.\n\n\`\`\`bash\n# Example code block\nterraform apply -var="blue_weight=0" -var="green_weight=100"\n\`\`\`\n\n> Blockquotes are great for calling out important notes.\n\nHappy writing!\n`;

export function PostEditor({ onBack, onPublished, post }: Props) {
  const [createdPost, setCreatedPost] = useState<PostResponse | null>(null);
  const isEditing = !!post || !!createdPost;
  const activePostId = post?.id ?? createdPost?.id;
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  // Form state — initialised from existing post if editing
  const [title, setTitle]       = useState(post?.title ?? "");
  const [slug, setSlug]         = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEditing);
  const [content, setContent]   = useState(post?.content ?? PLACEHOLDER);
  const [excerpt, setExcerpt]   = useState(post?.excerpt ?? "");
  const [status, setStatus]     = useState<PostStatus>(post?.status ?? "draft");
  const [featured, setFeatured] = useState(post?.featured ?? false);
  const [tags, setTags]         = useState<string[]>(post?.tags?.map((t) => t.name) ?? []);
  const [coverImage, setCoverImage] = useState<string | null>(post?.cover_image_url ?? null);
  const [date, setDate]         = useState<string>(() => {
    if (post?.published_at) return post.published_at.slice(0, 10);
    return new Date().toISOString().slice(0, 10);
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title (only while user hasn't manually edited it)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: () =>
      postsCreatePost({
        body: { title, slug, content, excerpt, status: "draft", featured, tag_names: tags, cover_image_url: coverImage },
      }),
    onSuccess: (data) => {
      showSuccessToast("Draft saved.");
      setCreatedPost(data.data ?? null);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => showErrorToast("Failed to save draft."),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      postsUpdatePost({
        path: { post_id: activePostId! },
        body: { title, slug, content, excerpt, status, featured, tag_names: tags, cover_image_url: coverImage },
      }),
    onSuccess: () => {
      showSuccessToast("Post saved.");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post?.slug ?? createdPost?.slug] });
    },
    onError: () => showErrorToast("Failed to save post."),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        await postsUpdatePost({ path: { post_id: activePostId! }, body: { title, slug, content, excerpt, featured, tag_names: tags, cover_image_url: coverImage } });
        return postsPublishPost({ path: { post_id: activePostId! } });
      } else {
        const created = await postsCreatePost({ body: { title, slug, content, excerpt, status: "draft", featured, tag_names: tags, cover_image_url: coverImage } });
        return postsPublishPost({ path: { post_id: created.data!.id } });
      }
    },
    onSuccess: (data) => {
      showSuccessToast("Post published!");
      setStatus("published");
      setCreatedPost(data.data ?? null);
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ["post", post?.slug ?? createdPost?.slug] });
      onPublished?.();
    },
    onError: () => showErrorToast("Failed to publish post."),
  });

  const isSaving    = createMutation.isPending || updateMutation.isPending;
  const isPublishing = publishMutation.isPending;
  const justSaved   = createMutation.isSuccess || updateMutation.isSuccess;
  const justPublished = publishMutation.isSuccess;

  const handleSave = () => { isEditing ? updateMutation.mutate() : createMutation.mutate(); };

  const handlePreview = async () => {
    if (!slug) return;
    if (!isEditing) {
      if (!title.trim() || !content.trim()) {
        showErrorToast("Please add a title and content before previewing.");
        return;
      }
      const previewWindow = window.open("", "_blank");
      if (!previewWindow) {
        showErrorToast("Please allow popups to preview.");
        return;
      }
      try {
        const result = await createMutation.mutateAsync();
        if (result.data) {
          setCreatedPost(result.data);
          previewWindow.location.href = `/blog/${result.data.slug}`;
        } else {
          previewWindow.close();
          showErrorToast("Failed to save draft for preview.");
        }
      } catch {
        previewWindow.close();
        showErrorToast("Failed to save draft for preview.");
      }
    } else {
      window.open(`/blog/${slug}`, "_blank");
    }
  };

  const canSubmit = title.trim().length > 0 && slug.trim().length > 0 && content.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080a1a", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ height: "60px", display: "flex", alignItems: "center", gap: "12px", padding: "0 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0a0c1e", flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.45)", background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", padding: "6px 8px", borderRadius: "7px", transition: "color 0.15s, background 0.15s", flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "transparent"; }}
        >
          <ArrowLeft size={15} />Dashboard
        </button>
        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

        {/* Title input */}
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Fraunces', serif", fontSize: "1.1875rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
        />

        {/* Mode badge */}
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", padding: "3px 8px", flexShrink: 0 }}>
          {isEditing ? "Editing" : "New post"}
        </span>

        {/* Preview */}
        <button
          disabled={isSaving || isPublishing}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "7px 14px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", cursor: (isSaving || isPublishing) ? "not-allowed" : "pointer", flexShrink: 0, transition: "all 0.15s", opacity: (isSaving || isPublishing) ? 0.5 : 1 }}
          onClick={handlePreview}
          onMouseEnter={(e) => { if (!(isSaving || isPublishing)) { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
        >
          <Eye size={14} />Preview
        </button>

        {/* Save draft */}
        <button
          onClick={handleSave}
          disabled={isSaving || !canSubmit}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: justSaved ? "#4ade80" : "rgba(255,255,255,0.75)", background: justSaved ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)", border: `1px solid ${justSaved ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", padding: "7px 14px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, cursor: isSaving || !canSubmit ? "not-allowed" : "pointer", flexShrink: 0, transition: "all 0.2s", opacity: !canSubmit ? 0.5 : 1 }}
        >
          {isSaving ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : justSaved ? <Check size={13} /> : <Save size={13} />}
          {isSaving ? "Saving…" : justSaved ? "Saved!" : "Save Draft"}
        </button>

        {/* Publish */}
        <button
          onClick={() => publishMutation.mutate()}
          disabled={isPublishing || !canSubmit}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", background: justPublished ? "rgba(74,222,128,0.2)" : "#5046e5", border: justPublished ? "1px solid rgba(74,222,128,0.4)" : "none", borderRadius: "8px", padding: "7px 16px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: isPublishing || !canSubmit ? "not-allowed" : "pointer", flexShrink: 0, transition: "all 0.2s", opacity: !canSubmit ? 0.5 : 1 }}
          onMouseEnter={(e) => { if (!isPublishing && !justPublished && canSubmit) e.currentTarget.style.background = "#4338ca"; }}
          onMouseLeave={(e) => { if (!isPublishing && !justPublished) e.currentTarget.style.background = justPublished ? "rgba(74,222,128,0.2)" : "#5046e5"; }}
        >
          {isPublishing ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : justPublished ? <Check size={13} color="#4ade80" /> : <Send size={13} />}
          {isPublishing ? "Publishing…" : justPublished ? "Published!" : "Publish"}
        </button>
      </div>

      {/* ── Body: editor + sidebar ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── Left: editor (70%) ── */}
        <div style={{ flex: "0 0 70%", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          {/* Slug row */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.1)" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{BRAND_DOMAIN}/blog/</span>
            <input
              value={slug}
              onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); }}
              placeholder="post-slug"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}
            />
            {slugEdited && (
              <button onClick={() => { setSlug(slugify(title)); setSlugEdited(false); }} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", color: "rgba(165,180,252,0.6)", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
                Reset
              </button>
            )}
          </div>

          <Toolbar textareaRef={textareaRef} setValue={setContent} />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck
            style={{ flex: 1, padding: "28px 36px", background: "transparent", border: "none", outline: "none", fontFamily: "'Inter', sans-serif", fontSize: "1rem", lineHeight: 1.85, color: "rgba(255,255,255,0.82)", resize: "none", overflowY: "auto" }}
          />

          <WordCountBar content={content} />
        </div>

        {/* ── Right: sidebar (30%) ── */}
        <div style={{ flex: "0 0 30%", overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <SidebarSection>
            <PublishPanel
              status={status} onStatusChange={setStatus}
              date={date} onDateChange={setDate}
              featured={featured} onFeaturedChange={setFeatured}
            />
          </SidebarSection>
          <SidebarSection><CoverUpload value={coverImage} onChange={setCoverImage} /></SidebarSection>
          <SidebarSection><TagsInput value={tags} onChange={setTags} /></SidebarSection>
          <SidebarSection><SeoPanel title={title} excerpt={excerpt} onExcerptChange={setExcerpt} /></SidebarSection>
        </div>
      </div>
    </div>
  );
}
