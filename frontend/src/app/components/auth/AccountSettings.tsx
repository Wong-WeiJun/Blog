import type { ReactNode, CSSProperties } from "react";
import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import {
  User, Shield, AlertTriangle, Camera, Eye, EyeOff,
  Monitor, Smartphone, Globe, LogOut, ArrowLeft, Loader2,
  CheckCircle2, X, Check,
} from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { type UserUpdateMe, type UpdatePassword, usersUpdateUserMe, usersUpdatePasswordMe } from "@/client";
import { usersUpdateAvatarMe } from "@/client/sdk.gen";
import useCustomToast from "../../../hooks/useCustomToast";

/* ─── types ─── */
type SettingsTab = "profile" | "security" | "danger";

/* ─── shared primitives ─── */

function Field({
  label, value, onChange, type = "text", placeholder, hint, error, rows, maxLength, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; error?: string;
  rows?: number; maxLength?: number; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;
  const borderColor = error ? "rgba(248,113,113,0.7)" : "rgba(255,255,255,0.1)";
  const focusBorder = error ? "rgba(248,113,113,0.9)" : "rgba(80,70,229,0.65)";
  const focusShadow = error ? "0 0 0 3px rgba(248,113,113,0.15)" : "0 0 0 3px rgba(80,70,229,0.18)";

  const sharedStyle: CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${borderColor}`,
    borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem",
    color: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        {rows ? (
          <textarea
            value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} rows={rows} maxLength={maxLength}
            style={{ ...sharedStyle, padding: "11px 14px", resize: "vertical" }}
            onFocus={(e) => { e.target.style.borderColor = focusBorder; e.target.style.boxShadow = focusShadow; }}
            onBlur={(e) => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
          />
        ) : (
          <input
            type={inputType} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} maxLength={maxLength} autoComplete={autoComplete}
            style={{ ...sharedStyle, padding: isPassword ? "11px 42px 11px 14px" : "11px 14px" }}
            onFocus={(e) => { e.target.style.borderColor = focusBorder; e.target.style.boxShadow = focusShadow; }}
            onBlur={(e) => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
          />
        )}
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "2px", display: "flex", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {maxLength && !rows && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "right" }}>
          {value.length}/{maxLength}
        </p>
      )}
      {maxLength && rows && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "right" }}>
          {value.length}/{maxLength}
        </p>
      )}
      {hint && !error && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hint}</p>}
      {error && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "#f87171", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
          <AlertTriangle size={11} />{error}
        </p>
      )}
    </div>
  );
}

function SaveButton({ onClick, loading, saved }: { onClick: () => void; loading: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "7px",
        padding: "10px 22px", background: saved ? "rgba(74,222,128,0.18)" : "#5046e5",
        color: saved ? "#4ade80" : "#fff", border: saved ? "1px solid rgba(74,222,128,0.35)" : "none",
        borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
        fontWeight: 600, cursor: loading ? "default" : "pointer", transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { if (!loading && !saved) e.currentTarget.style.background = "#4338ca"; }}
      onMouseLeave={(e) => { if (!loading && !saved) e.currentTarget.style.background = "#5046e5"; }}
    >
      {loading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
      {saved && <CheckCircle2 size={14} />}
      {loading ? "Saving…" : saved ? "Saved!" : "Save changes"}
    </button>
  );
}

function SectionCard({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <div style={{
      background: danger ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.025)",
      border: `1px solid ${danger ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: "14px", padding: "28px 28px",
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <h2 style={{
      fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.125rem",
      color: danger ? "#f87171" : "#fff", margin: "0 0 4px",
    }}>
      {children}
    </h2>
  );
}

function SectionDesc({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", margin: "0 0 24px", lineHeight: 1.6 }}>
      {children}
    </p>
  );
}

/* ─── Avatar upload ─── */

type AvatarUploadStatus = "idle" | "requesting" | "uploading" | "saving" | "done" | "error";

async function uploadAvatarToS3(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/v1/uploads/avatar-url", {
    method: "POST",
    headers,
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? "Failed to get upload URL");
  }
  const { url, fields, public_url } = await res.json() as {
    url: string; fields: Record<string, string>; public_url: string;
  };

  return new Promise((resolve, reject) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 204 || xhr.status === 200) resolve(public_url);
      else reject(new Error(`S3 upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.open("POST", url);
    xhr.send(fd);
  });
}

function AvatarUpload({
  currentUrl,
  name,
  onSaved,
}: {
  currentUrl: string | null;
  name: string;
  onSaved: (url: string | null) => void;
}) {
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const queryClient = useQueryClient();

  const [uploadStatus, setUploadStatus] = useState<AvatarUploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveMutation = useMutation({
    mutationFn: async (avatarUrl: string | null) => {
      const res = await usersUpdateAvatarMe({ body: { avatar_url: avatarUrl } });
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: (res) => {
      const saved = (res.data as any)?.avatar_url ?? null;
      onSaved(saved);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setUploadStatus("done");
      showSuccessToast("Profile picture updated.");
    },
    onError: () => {
      setErrorMsg("Saved to S3 but failed to update your profile. Try again.");
      setUploadStatus("error");
      showErrorToast("Failed to save avatar URL.");
    },
  });

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select an image file.");
      setUploadStatus("error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image must be under 5 MB.");
      setUploadStatus("error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setErrorMsg(null);
    setProgress(0);
    setUploadStatus("requesting");

    try {
      setUploadStatus("uploading");
      const publicUrl = await uploadAvatarToS3(file, setProgress);
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
      setUploadStatus("saving");
      saveMutation.mutate(publicUrl);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setUploadStatus("error");
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  }, [saveMutation]);

  const handleRemove = () => {
    saveMutation.mutate(null);
    setUploadStatus("saving");
    setLocalPreview(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displaySrc = localPreview ?? currentUrl;
  const firstLetter = name[0]?.toUpperCase() ?? "U";
  const isUploading = uploadStatus === "requesting" || uploadStatus === "uploading" || uploadStatus === "saving";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <div
        style={{ position: "relative", cursor: isUploading ? "wait" : "pointer", flexShrink: 0 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {/* Avatar circle */}
        <div style={{
          width: "88px", height: "88px", borderRadius: "50%",
          background: displaySrc ? "transparent" : "linear-gradient(135deg, rgba(80,70,229,0.5), rgba(129,140,248,0.35))",
          border: hover && !isUploading ? "2px solid #5046e5" : "2px solid rgba(80,70,229,0.4)",
          overflow: "hidden", transition: "border-color 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {displaySrc ? (
            <img src={displaySrc} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover", filter: isUploading ? "brightness(0.45)" : "none", transition: "filter 0.2s" }} />
          ) : (
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#a5b4fc" }}>{firstLetter}</span>
          )}
        </div>

        {/* Camera overlay */}
        {!isUploading && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "3px",
            opacity: hover ? 1 : 0, transition: "opacity 0.2s",
          }}>
            <Camera size={18} color="#fff" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.6rem", fontWeight: 600, color: "#fff", letterSpacing: "0.04em" }}>EDIT</span>
          </div>
        )}

        {/* Upload spinner overlay */}
        {isUploading && (
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            <Loader2 size={18} color="#fff" style={{ animation: "spin 0.8s linear infinite" }} />
            {uploadStatus === "uploading" && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.8)" }}>{progress}%</span>
            )}
          </div>
        )}

        {/* Green dot — online indicator */}
        {!isUploading && (
          <div style={{
            position: "absolute", bottom: "4px", right: "4px",
            width: "14px", height: "14px", borderRadius: "50%",
            background: "#4ade80", border: "2px solid #0a0c1e",
          }} />
        )}

        {/* Done tick */}
        {uploadStatus === "done" && !isUploading && (
          <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "20px", height: "20px", borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0a0c1e" }}>
            <Check size={11} color="#fff" strokeWidth={3} />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "#fff", margin: 0 }}>Profile photo</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>JPG, PNG, WebP · Max 5 MB</p>

        {/* Status label */}
        {uploadStatus === "saving" && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#a5b4fc", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
            <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> Saving…
          </p>
        )}
        {uploadStatus === "done" && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#4ade80", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
            <Check size={11} /> Saved!
          </p>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button
            onClick={() => !isUploading && inputRef.current?.click()}
            disabled={isUploading}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 500, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "7px", padding: "5px 12px", cursor: isUploading ? "not-allowed" : "pointer", transition: "background 0.15s", opacity: isUploading ? 0.5 : 1 }}
            onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.background = "rgba(80,70,229,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(80,70,229,0.12)"; }}
          >
            {isUploading ? "Uploading…" : "Upload"}
          </button>

          {(currentUrl || localPreview) && !isUploading && (
            <button
              onClick={handleRemove}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", fontWeight: 500, color: "rgba(255,255,255,0.45)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "5px 12px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <X size={11} /> Remove
            </button>
          )}
        </div>

        {/* Error */}
        {uploadStatus === "error" && errorMsg && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "7px", padding: "8px 11px", marginTop: "2px", maxWidth: "320px" }}>
            <AlertTriangle size={12} color="#f87171" style={{ marginTop: "1px", flexShrink: 0 }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Profile tab ─── */

function ProfileTab({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatar] = useState<string | null>(user?.avatarUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserUpdateMe) => usersUpdateUserMe({ body: data, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      showSuccessToast("Profile updated successfully");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => {
      showErrorToast("Failed to update profile");
    },
  });

  const save = () => {
    setLoading(true);
    updateProfileMutation.mutate(
      { full_name: name, email },
      {
        onSettled: () => setLoading(false),
      },
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <SectionCard>
        <SectionTitle>Public profile</SectionTitle>
        <SectionDesc>This information will be shown on your comments and public author page.</SectionDesc>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AvatarUpload
            currentUrl={avatarUrl}
            name={name || user?.name || "User"}
            onSaved={(url) => setAvatar(url)}
          />
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <Field label="Display name" value={name} onChange={setName} placeholder="Your name" maxLength={48} />
          <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell readers a bit about yourself…" rows={4} maxLength={200} />
          <Field label="Website" value={website} onChange={setWebsite} placeholder="https://yoursite.com" type="url" />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton onClick={save} loading={loading || updateProfileMutation.isPending} saved={saved} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Email address</SectionTitle>
        <SectionDesc>Your email is private and used only for login and notifications.</SectionDesc>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} color="#4ade80" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#4ade80" }}>Verified</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Password strength ─── */

function StrengthBar({ password }: { password: string }) {
  if (!password) return null;
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const colors = ["", "#f87171", "#fbbf24", "#fbbf24", "#4ade80"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", gap: "4px" }}>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: i < score ? colors[score] : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
        ))}
      </div>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: colors[score], margin: 0, fontWeight: 500 }}>{labels[score]}</p>
    </div>
  );
}

/* ─── Session card ─── */

const SESSIONS = [
  { id: 1, device: "MacBook Pro", os: "macOS 15", browser: "Chrome 126", location: "Local", current: true,  icon: <Monitor size={16} />, lastSeen: "Now" },
  { id: 2, device: "iPhone 15 Pro", os: "iOS 17", browser: "Safari Mobile", location: "Local", current: false, icon: <Smartphone size={16} />, lastSeen: "2 hours ago" },
  { id: 3, device: "Unknown Device", os: "Windows 11", browser: "Firefox 127", location: "Remote",  current: false, icon: <Globe size={16} />, lastSeen: "3 days ago" },
];

function SessionRow({ session, onRevoke }: { session: typeof SESSIONS[0]; onRevoke: (id: number) => void }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: session.current ? "rgba(80,70,229,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${session.current ? "rgba(80,70,229,0.4)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: session.current ? "#a5b4fc" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>
        {session.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", margin: 0 }}>{session.device}</p>
          {session.current && (
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.65rem", fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "999px", padding: "1px 8px" }}>Current</span>
          )}
        </div>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", margin: "3px 0 0" }}>
          {session.browser} · {session.os} · {session.location} · {session.lastSeen}
        </p>
      </div>
      {!session.current && (
        confirming ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171" }}>Revoke?</span>
            <button onClick={() => onRevoke(session.id)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "#fff", background: "#dc2626", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}>Yes</button>
            <button onClick={() => setConfirming(false)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}>No</button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "6px 12px", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(248,113,113,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <LogOut size={13} />Revoke
          </button>
        )
      )}
    </div>
  );
}

/* ─── Security tab ─── */

function SecurityTab({ userEmail: _userEmail }: { userEmail: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const changePasswordMutation = useMutation({
    mutationFn: (data: UpdatePassword) => usersUpdatePasswordMe({ body: data, throwOnError: true }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully");
      setSaved(true);
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => {
      showErrorToast("Failed to update password. Check your current password.");
    },
  });

  const save = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = "Enter your current password.";
    if (next.length < 8) e.next = "New password must be at least 8 characters.";
    if (next !== confirm) e.confirm = "Passwords don't match.";
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    changePasswordMutation.mutate(
      { current_password: current, new_password: next },
      { onSettled: () => setLoading(false) },
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <SectionCard>
        <SectionTitle>Change password</SectionTitle>
        <SectionDesc>Use a strong, unique password you don't use elsewhere.</SectionDesc>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Field label="Current password" type="password" value={current} onChange={setCurrent} placeholder="••••••••" error={errors.current} autoComplete="current-password" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Field label="New password" type="password" value={next} onChange={setNext} placeholder="••••••••" error={errors.next} autoComplete="new-password" />
            <StrengthBar password={next} />
          </div>
          <Field label="Confirm new password" type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" error={errors.confirm} autoComplete="new-password" />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <SaveButton onClick={save} loading={loading || changePasswordMutation.isPending} saved={saved} />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Active sessions</SectionTitle>
        <SectionDesc>Devices currently signed in to your account. Revoke any session you don't recognise.</SectionDesc>
        <div>
          {sessions.map((s) => (
            <SessionRow key={s.id} session={s} onRevoke={(id) => setSessions((prev) => prev.filter((x) => x.id !== id))} />
          ))}
          {sessions.length === 1 && (
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", marginTop: "16px" }}>
              No other active sessions.
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Delete confirm modal ─── */

function DeleteModal({ email, onCancel, onConfirm }: { email: string; onCancel: () => void; onConfirm: () => void; }) {
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const matches = typed.trim().toLowerCase() === email.toLowerCase();

  const submit = () => {
    if (!matches) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 1400);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />

      {/* Modal card */}
      <div style={{ position: "relative", width: "100%", maxWidth: "420px", background: "#0d0f20", border: "1px solid rgba(239,68,68,0.35)", borderRadius: "16px", padding: "28px", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
        <button onClick={onCancel} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "4px", borderRadius: "6px", display: "flex", transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          <X size={18} />
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Icon */}
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>

          <div>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: "0 0 8px" }}>Delete your account</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.65 }}>
              This will permanently delete your account, all your comments, bookmarks, and settings. <strong style={{ color: "rgba(255,255,255,0.8)" }}>This action cannot be undone.</strong>
            </p>
          </div>

          {/* Confirm input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.55)" }}>
              Type <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#f87171", fontSize: "0.8rem" }}>{email}</span> to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={email}
              style={{ width: "100%", padding: "11px 14px", background: "rgba(239,68,68,0.06)", border: `1px solid ${matches && typed ? "rgba(74,222,128,0.5)" : "rgba(239,68,68,0.3)"}`, borderRadius: "9px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", color: matches && typed ? "#4ade80" : "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, color 0.2s" }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onCancel} style={{ flex: 1, padding: "11px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!matches || loading}
              style={{ flex: 1, padding: "11px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: matches && !loading ? "#dc2626" : "rgba(239,68,68,0.25)", border: "none", borderRadius: "9px", cursor: matches && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "background 0.15s" }}
              onMouseEnter={(e) => { if (matches && !loading) e.currentTarget.style.background = "#b91c1c"; }}
              onMouseLeave={(e) => { if (matches && !loading) e.currentTarget.style.background = "#dc2626"; }}
            >
              {loading && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
              {loading ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Danger Zone tab ─── */

function DangerTab({ userEmail, onDelete }: { userEmail: string; onDelete: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { logout, user } = useAuth();

  // Prevent superuser from deleting themselves
  const isSuperuser = user?.role === "admin";

  if (deleted) {
    return (
      <SectionCard danger>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 0", textAlign: "center" }}>
          <CheckCircle2 size={40} color="#4ade80" />
          <div>
            <p style={{ fontFamily: "'Fraunces', serif", fontSize: "1.25rem", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>Account deleted</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>Your account has been permanently removed.</p>
          </div>
        </div>
      </SectionCard>
    );
  }

  const handleConfirmDelete = () => {
    setShowModal(false);
    setDeleted(true);
    logout();
    onDelete();
  };

  return (
    <>
      <SectionCard danger>
        <SectionTitle danger>Danger Zone</SectionTitle>
        <SectionDesc>Actions here are permanent and cannot be reversed. Please proceed with caution.</SectionDesc>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Delete account row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "20px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px" }}>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Delete this account</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
                Permanently remove your account, comments, and all associated data.
              </p>
              {isSuperuser && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#fbbf24", margin: "6px 0 0" }}>
                  Superuser accounts must be deleted via the admin panel.
                </p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={isSuperuser}
              style={{
                display: "flex", alignItems: "center", gap: "7px", padding: "10px 20px",
                fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600,
                color: isSuperuser ? "rgba(255,255,255,0.3)" : "#fff",
                background: isSuperuser ? "rgba(239,68,68,0.2)" : "#dc2626",
                border: "none", borderRadius: "9px",
                cursor: isSuperuser ? "not-allowed" : "pointer",
                flexShrink: 0, transition: "background 0.15s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!isSuperuser) { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.transform = "translateY(-1px)"; }
              }}
              onMouseLeave={(e) => {
                if (!isSuperuser) { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.transform = "none"; }
              }}
            >
              <AlertTriangle size={15} />
              Delete Account
            </button>
          </div>

          {/* Export data row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "20px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px" }}>
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Export your data</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Download a copy of your comments, bookmarks, and profile.
              </p>
            </div>
            <button
              style={{ padding: "10px 20px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 500, color: "rgba(255,255,255,0.65)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9px", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            >
              Export data
            </button>
          </div>
        </div>
      </SectionCard>

      {showModal && (
        <DeleteModal
          email={userEmail}
          onCancel={() => setShowModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </>
  );
}

/* ─── Root component ─── */

const TABS: { id: SettingsTab; label: string; icon: ReactNode }[] = [
  { id: "profile",  label: "Profile",      icon: <User size={15} /> },
  { id: "security", label: "Security",     icon: <Shield size={15} /> },
  { id: "danger",   label: "Danger Zone",  icon: <AlertTriangle size={15} /> },
];

export function AccountSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SettingsTab>("profile");
  const displayName = user?.name ?? "User";
  const displayRole = user?.role === "admin" ? "Blog Owner" : "Reader";
  const displayEmail = user?.email ?? "";
  const avatarColor = user?.role === "admin"
    ? { bg: "linear-gradient(135deg, rgba(80,70,229,0.5), rgba(129,140,248,0.35))", border: "rgba(80,70,229,0.5)", text: "#a5b4fc" }
    : { bg: "linear-gradient(135deg, rgba(110,231,183,0.4), rgba(52,211,153,0.3))", border: "rgba(110,231,183,0.5)", text: "#6ee7b7" };

  const handleDelete = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #080a1a 0%, #0a0c1e 45%, #060818 100%)", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Top bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, background: "rgba(8,10,26,0.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", padding: 0, transition: "color 0.15s", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <ArrowLeft size={15} />Back
        </Link>
        <div style={{ width: "1px", height: "18px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff" }}>Account Settings</span>
      </div>

      {/* Body */}
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px", display: "flex", gap: "32px", alignItems: "flex-start" }}>

        {/* Left sidebar nav */}
        <aside style={{ width: "192px", flexShrink: 0, position: "sticky", top: "92px" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TABS.map(({ id, label, icon }) => {
              const active = tab === id;
              const isDanger = id === "danger";
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 12px", borderRadius: "8px", border: "none",
                    background: active ? (isDanger ? "rgba(239,68,68,0.12)" : "rgba(80,70,229,0.15)") : "transparent",
                    color: active ? (isDanger ? "#f87171" : "#a5b4fc") : isDanger ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.5)",
                    fontFamily: "'Inter', sans-serif", fontSize: "0.875rem",
                    fontWeight: active ? 600 : 400, cursor: "pointer",
                    width: "100%", textAlign: "left", position: "relative",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = isDanger ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)"; e.currentTarget.style.color = isDanger ? "#f87171" : "rgba(255,255,255,0.8)"; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDanger ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.5)"; } }}
                >
                  {active && <div style={{ position: "absolute", left: 0, top: "6px", bottom: "6px", width: "3px", borderRadius: "0 2px 2px 0", background: isDanger ? "#ef4444" : "#5046e5" }} />}
                  {icon}
                  {label}
                </button>
              );
            })}
          </nav>

          {/* User card */}
          <div style={{ marginTop: "32px", padding: "14px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: user?.avatarUrl ? "transparent" : avatarColor.bg, border: `1.5px solid ${avatarColor.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: "0.875rem", fontWeight: 700, color: avatarColor.text }}>{displayName.slice(0, 1)}</span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{displayRole}</p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{ display: "flex", alignItems: "center", gap: "6px", width: "100%", padding: "7px 8px", background: "transparent", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "7px", fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(248,113,113,0.7)", cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.7)"; }}
            >
              <LogOut size={12} />Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {tab === "profile"  && <ProfileTab user={user} />}
          {tab === "security" && <SecurityTab userEmail={displayEmail} />}
          {tab === "danger"   && <DangerTab userEmail={displayEmail} onDelete={handleDelete} />}
        </main>
      </div>
    </div>
  );
}
