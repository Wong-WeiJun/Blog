import type { ReactNode, RefObject, DragEvent } from "react";
import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft, Bold, Italic, Code, Heading2, Heading3, Link2,
  ImagePlus, Quote, Save, Send, Eye, X, Upload, Globe,
  Calendar, Loader2, Check,
} from "lucide-react";
import { BRAND_DOMAIN } from "../../../lib/constants";

/* ───────────────────────────── types ───────────────────────────── */

interface Props {
  onBack: () => void;
  initialTitle?: string;
  initialContent?: string;
}

/* ───────────────────────── toolbar button ───────────────────────── */

function ToolBtn({
  icon, label, active, onClick,
}: { icon: ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "32px", height: "32px", borderRadius: "6px", border: "none",
        background: active ? "rgba(80,70,229,0.22)" : "transparent",
        color: active ? "#a5b4fc" : "rgba(255,255,255,0.55)",
        cursor: "pointer", transition: "background 0.12s, color 0.12s", flexShrink: 0,
      }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; } }}
    >
      {icon}
    </button>
  );
}

/* ──────────────────────── rich-text toolbar ─────────────────────── */

function insertWrap(
  ref: RefObject<HTMLTextAreaElement | null>,
  setValue: (v: string) => void,
  wrap: string,
  block?: string,
) {
  const el = ref.current;
  if (!el) return;
  const { selectionStart: s, selectionEnd: e, value } = el;
  const sel = value.slice(s, e);
  let replacement: string;
  if (block) {
    replacement = `${block}${sel || "text"}`;
  } else {
    replacement = `${wrap}${sel || "text"}${wrap}`;
  }
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
    setActiveFormats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const tools = [
    { key: "bold",   icon: <Bold size={14} />,      label: "Bold (Ctrl+B)",    action: () => toggle("bold", "**") },
    { key: "italic", icon: <Italic size={14} />,    label: "Italic (Ctrl+I)",  action: () => toggle("italic", "_") },
    { key: "code",   icon: <Code size={14} />,      label: "Inline code",      action: () => toggle("code", "`") },
    null,
    { key: "h2",     icon: <Heading2 size={14} />,  label: "Heading 2",        action: () => insertWrap(textareaRef, setValue, "", "## ") },
    { key: "h3",     icon: <Heading3 size={14} />,  label: "Heading 3",        action: () => insertWrap(textareaRef, setValue, "", "### ") },
    { key: "quote",  icon: <Quote size={14} />,     label: "Blockquote",       action: () => insertWrap(textareaRef, setValue, "", "> ") },
    null,
    { key: "link",   icon: <Link2 size={14} />,     label: "Insert link",      action: () => insertWrap(textareaRef, setValue, "", "[text](url)") },
    { key: "image",  icon: <ImagePlus size={14} />, label: "Insert image",     action: () => insertWrap(textareaRef, setValue, "", "![alt](url)") },
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
      {/* Code block */}
      <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
      <ToolBtn
        icon={<span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>{"</>"}</span>}
        label="Code block"
        onClick={() => {
          const el = textareaRef.current;
          if (!el) return;
          const { selectionStart: s, value } = el;
          const block = "\n```\ncode here\n```\n";
          setValue(value.slice(0, s) + block + value.slice(s));
        }}
      />
    </div>
  );
}

/* ─────────────────────────── cover upload ───────────────────────── */

function CoverUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        Cover Image
      </p>

      {preview ? (
        <div style={{ position: "relative", borderRadius: "9px", overflow: "hidden", aspectRatio: "16/9" }}>
          <img src={preview} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <button
            onClick={() => setPreview(null)}
            style={{ position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{ border: `2px dashed ${dragging ? "#5046e5" : "rgba(255,255,255,0.1)"}`, borderRadius: "9px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", background: dragging ? "rgba(80,70,229,0.06)" : "transparent", transition: "all 0.15s", textAlign: "center" }}
        >
          <Upload size={20} color="rgba(255,255,255,0.25)" />
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.5)", margin: "0 0 2px" }}>
              Drag & drop or <span style={{ color: "#a5b4fc" }}>browse</span>
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)", margin: 0 }}>PNG, JPG, WebP · 16:9 recommended</p>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
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

function TagsInput() {
  const [tags, setTags]       = useState<string[]>(["Terraform", "AWS"]);
  const [input, setInput]     = useState("");
  const [showSugg, setShowSugg] = useState(false);

  const addTag = (t: string) => {
    const val = t.trim();
    if (val && !tags.includes(val)) setTags((prev) => [...prev, val]);
    setInput("");
    setShowSugg(false);
  };

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  const suggestions = SUGGESTED_TAGS.filter((s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        Tags
      </p>

      {/* Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {tags.map((tag) => {
          const color = TAG_COLORS[tag] ?? "#6b7280";
          return (
            <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}35`, borderRadius: "6px", padding: "3px 8px" }}>
              {tag}
              <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color, padding: "0", display: "flex", opacity: 0.7, transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              >
                <X size={11} />
              </button>
            </span>
          );
        })}
      </div>

      {/* Input */}
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
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── publish panel ────────────────────────── */

function PublishPanel() {
  const [status, setStatus]     = useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);
  const [date, setDate]         = useState("2026-06-12");

  const Toggle = ({ on, onToggle, label, sublabel, color = "#5046e5" }: { on: boolean; onToggle: () => void; label: string; sublabel?: string; color?: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#fff", margin: 0 }}>{label}</p>
        {sublabel && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{sublabel}</p>}
      </div>
      <button
        onClick={onToggle}
        style={{ width: "40px", height: "22px", borderRadius: "999px", border: "none", cursor: "pointer", position: "relative", background: on ? color : "rgba(255,255,255,0.12)", transition: "background 0.2s", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", top: "3px", left: on ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        Publish Settings
      </p>

      {/* Status toggle */}
      <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9px", overflow: "hidden" }}>
        {(["draft", "published"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{ flex: 1, padding: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.15s", background: status === s ? (s === "published" ? "rgba(74,222,128,0.18)" : "rgba(80,70,229,0.18)") : "transparent", color: status === s ? (s === "published" ? "#4ade80" : "#a5b4fc") : "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: status === s ? (s === "published" ? "#4ade80" : "#a5b4fc") : "rgba(255,255,255,0.2)", display: "inline-block" }} />
            {s === "draft" ? "Draft" : "Published"}
          </button>
        ))}
      </div>

      {/* Date */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "5px" }}>
          <Calendar size={12} />Publication date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", color: "#fff", outline: "none", boxSizing: "border-box", colorScheme: "dark" }}
        />
      </div>

      {/* Featured */}
      <Toggle on={featured} onToggle={() => setFeatured((f) => !f)} label="Featured post" sublabel="Pin to homepage hero section" color="#f59e0b" />
    </div>
  );
}

/* ──────────────────────── SEO panel ────────────────────────── */

function SeoPanel({ title }: { title: string }) {
  const [metaTitle, setMetaTitle]   = useState(title || "Zero-Downtime Blue-Green Deployments");
  const [metaDesc, setMetaDesc]     = useState("Learn how to orchestrate seamless container deployments using Terraform modules, weighted target groups, and CloudWatch alarms.");

  // Sync meta title with post title when user hasn't edited it
  const [titleEdited, setTitleEdited] = useState(false);
  const effectiveTitle = titleEdited ? metaTitle : (title || metaTitle);

  const titleLen = effectiveTitle.length;
  const descLen  = metaDesc.length;
  const titleOk  = titleLen >= 30 && titleLen <= 60;
  const descOk   = descLen >= 70 && descLen <= 160;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
        SEO
      </p>

      {/* Meta title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Meta title</label>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: titleOk ? "#4ade80" : titleLen > 60 ? "#f87171" : "rgba(255,255,255,0.3)" }}>
            {titleLen}/60
          </span>
        </div>
        <input
          value={effectiveTitle}
          onChange={(e) => { setMetaTitle(e.target.value); setTitleEdited(true); }}
          maxLength={70}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${titleOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = titleOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* Meta description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>Meta description</label>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: descOk ? "#4ade80" : descLen > 160 ? "#f87171" : "rgba(255,255,255,0.3)" }}>
            {descLen}/160
          </span>
        </div>
        <textarea
          value={metaDesc}
          onChange={(e) => setMetaDesc(e.target.value)}
          rows={3}
          maxLength={180}
          style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${descOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box", resize: "vertical", transition: "border-color 0.15s" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(80,70,229,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = descOk ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)")}
        />
      </div>

      {/* OG preview card */}
      <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", overflow: "hidden" }}>
        {/* Fake OG image strip */}
        <div style={{ height: "72px", background: "linear-gradient(135deg, #0d0f24, #130d28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(165,180,252,0.4)" }}>og:image preview</span>
        </div>
        <div style={{ padding: "10px 12px", background: "rgba(255,255,255,0.025)" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: "0 0 3px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Globe size={9} />{BRAND_DOMAIN}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", margin: "0 0 3px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {effectiveTitle || "Post title"}
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {metaDesc || "Meta description will appear here…"}
          </p>
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
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)" }}>
        {words.toLocaleString()} words
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
        {chars.toLocaleString()} chars
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "rgba(165,180,252,0.55)" }}>
        ~{readMin} min read
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.2)" }}>
        Markdown
      </span>
    </div>
  );
}

/* ─────────────────────── sidebar section wrapper ────────────────── */

function SidebarSection({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "16px" }}>
      {children}
    </div>
  );
}

/* ────────────────────────── main editor ────────────────────────── */

const PLACEHOLDER = `## Introduction

Start writing your post here. This editor supports **Markdown** syntax.

Use the toolbar above to insert formatting, headings, code blocks, and links.

\`\`\`bash
# Example code block
terraform apply -var="blue_weight=0" -var="green_weight=100"
\`\`\`

> Blockquotes are great for calling out important notes.

Happy writing!
`;

export function PostEditor({ onBack, initialTitle = "", initialContent = PLACEHOLDER }: Props) {
  const [title, setTitle]     = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished]   = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSaveDraft = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 800);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => { setPublishing(false); setPublished(true); setTimeout(() => { setPublished(false); }, 2500); }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#080a1a", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title…"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Fraunces', serif", fontSize: "1.1875rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}
        />

        {/* Preview */}
        <button
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "8px", padding: "7px 14px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; }}
        >
          <Eye size={14} />Preview
        </button>

        {/* Save draft */}
        <button
          onClick={handleSaveDraft}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: saved ? "#4ade80" : "rgba(255,255,255,0.75)", background: saved ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.06)", border: `1px solid ${saved ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", padding: "7px 14px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}
        >
          {saving ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : saved ? <Check size={13} /> : <Save size={13} />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Draft"}
        </button>

        {/* Publish */}
        <button
          onClick={handlePublish}
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fff", background: published ? "rgba(74,222,128,0.2)" : "#5046e5", border: published ? "1px solid rgba(74,222,128,0.4)" : "none", borderRadius: "8px", padding: "7px 16px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}
          onMouseEnter={(e) => { if (!publishing && !published) e.currentTarget.style.background = "#4338ca"; }}
          onMouseLeave={(e) => { if (!publishing && !published) e.currentTarget.style.background = "#5046e5"; }}
        >
          {publishing ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : published ? <Check size={13} color="#4ade80" /> : <Send size={13} />}
          {publishing ? "Publishing…" : published ? "Published!" : "Publish"}
        </button>
      </div>

      {/* ── Body: editor + sidebar ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* ── Left: editor (70%) ── */}
        <div style={{ flex: "0 0 70%", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <Toolbar textareaRef={textareaRef} setValue={setContent} />

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck
            style={{
              flex: 1, padding: "28px 36px", background: "transparent", border: "none", outline: "none",
              fontFamily: "'Inter', sans-serif", fontSize: "1rem", lineHeight: 1.85,
              color: "rgba(255,255,255,0.82)", resize: "none", overflowY: "auto",
            }}
          />

          <WordCountBar content={content} />
        </div>

        {/* ── Right: sidebar (30%) ── */}
        <div style={{ flex: "0 0 30%", overflowY: "auto", padding: "20px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <SidebarSection><PublishPanel /></SidebarSection>
          <SidebarSection><CoverUpload /></SidebarSection>
          <SidebarSection><TagsInput /></SidebarSection>
          <SidebarSection><SeoPanel title={title} /></SidebarSection>
        </div>
      </div>
    </div>
  );
}
