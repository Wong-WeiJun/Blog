import type { CSSProperties } from "react";
import { useState, useRef, useCallback } from "react";
import {
  Camera, Check, CheckCircle2, Loader2, AlertCircle, X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersUpdateUserMe, usersUpdateAvatarMe, uploadsGetAvatarUploadUrl } from "@/client/sdk.gen";
import { useAuth } from "../../../lib/auth-context";
import { BRAND_NAME, BRAND_EMAIL, BRAND_HANDLE, BRAND_GITHUB } from "../../../lib/constants";
import useCustomToast from "../../../hooks/useCustomToast";

/* ──────────────────────────── Field ───────────────────────────────── */

function Field({
  label, value, onChange, type = "text", placeholder, hint, rows, maxLength, readOnly,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
  placeholder?: string; hint?: string; rows?: number; maxLength?: number; readOnly?: boolean;
}) {
  const baseStyle: CSSProperties = {
    width: "100%", background: readOnly ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "9px",
    fontFamily: "'Inter', sans-serif", fontSize: "0.9375rem",
    color: readOnly ? "rgba(255,255,255,0.45)" : "#fff",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
    cursor: readOnly ? "default" : "text",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
        {label}
      </label>
      {rows ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} rows={rows} maxLength={maxLength} readOnly={readOnly}
          style={{ ...baseStyle, padding: "11px 14px", resize: "vertical" }}
          onFocus={(e) => { if (!readOnly) { e.target.style.borderColor = "rgba(80,70,229,0.65)"; e.target.style.boxShadow = "0 0 0 3px rgba(80,70,229,0.18)"; } }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} maxLength={maxLength} readOnly={readOnly}
          style={{ ...baseStyle, padding: "11px 14px" }}
          onFocus={(e) => { if (!readOnly) { e.target.style.borderColor = "rgba(80,70,229,0.65)"; e.target.style.boxShadow = "0 0 0 3px rgba(80,70,229,0.18)"; } }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
        />
      )}
      {maxLength && (
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", margin: 0, textAlign: "right" }}>
          {value.length}/{maxLength}
        </p>
      )}
      {hint && <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>{hint}</p>}
    </div>
  );
}

/* ──────────────────────── R2 avatar upload ────────────────────────── */

type AvatarUploadStatus = "idle" | "requesting" | "uploading" | "saving" | "done" | "error";

async function uploadAvatarToR2(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const res = await uploadsGetAvatarUploadUrl({
    body: { filename: file.name, content_type: file.type },
    throwOnError: true,
  });
  const { url, fields, public_url } = res.data;

  // Step 2 — POST directly to R2 with presigned fields
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
      else reject(new Error(`Upload failed: ${xhr.status}`));
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
  const [progress, setProgress]         = useState(0);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);
  const [hover, setHover]               = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persists the public URL to the backend after R2 upload completes
  const saveMutation = useMutation({
    mutationFn: async (avatarUrl: string | null) => {
      const res = await usersUpdateAvatarMe({ body: { avatar_url: avatarUrl } });
      // 1. Throw the error so React Query knows it failed and triggers onError
      if (res.error) throw res.error; 
      return res;
    },
    onSuccess: (res) => {
      // 2. Access the data safely. 
      // Note: Your TS tooltip shows res.data is typed as a primitive (string | boolean | null).
      // If your backend actually returns an object like { avatar_url: "..." }, use a type cast:
      const saved = (res.data as any)?.avatar_url ?? null;
      
      // ALTERNATIVE: If your backend returns the raw URL string directly as res.data, use this instead:
      // const saved = typeof res.data === 'string' ? res.data : null;

      onSaved(saved);
      // Invalidate so Navbar and any other consumer re-renders
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["about"] });
      setUploadStatus("done");
      showSuccessToast("Profile picture updated.");
    },
    onError: () => {
      setErrorMsg("Uploaded but failed to update your profile. Try again.");
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
      const publicUrl = await uploadAvatarToR2(file, setProgress);
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
  const firstLetter = name[0]?.toUpperCase() ?? "Y";
  const isUploading = uploadStatus === "requesting" || uploadStatus === "uploading" || uploadStatus === "saving";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
      {/* Avatar circle */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        <div
          style={{ position: "relative", cursor: isUploading ? "wait" : "pointer" }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: displaySrc ? "transparent" : "linear-gradient(135deg, rgba(80,70,229,0.5), rgba(129,140,248,0.35))", border: hover && !isUploading ? "2px solid #5046e5" : "2px solid rgba(80,70,229,0.45)", overflow: "hidden", transition: "border-color 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {displaySrc ? (
              <img
                src={displaySrc}
                alt="Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: isUploading ? "brightness(0.45)" : "none", transition: "filter 0.2s" }}
              />
            ) : (
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#a5b4fc" }}>{firstLetter}</span>
            )}
          </div>

          {/* Hover overlay */}
          {!isUploading && (
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px", opacity: hover ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none" }}>
              <Camera size={16} color="#fff" />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.52rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>CHANGE</span>
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

          {/* Done tick */}
          {uploadStatus === "done" && !isUploading && (
            <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "20px", height: "20px", borderRadius: "50%", background: "#4ade80", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #0a0c1e" }}>
              <Check size={11} color="#fff" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Progress bar under avatar */}
        {uploadStatus === "uploading" && (
          <div style={{ width: "88px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#5046e5", borderRadius: "999px", transition: "width 0.15s" }} />
          </div>
        )}
      </div>

      {/* Right side text + buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "4px" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>Profile photo</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          JPEG, PNG, WebP · Max 5 MB
        </p>

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

        <div style={{ display: "flex", gap: "7px", marginTop: "4px", flexWrap: "wrap" }}>
          <button
            onClick={() => !isUploading && inputRef.current?.click()}
            disabled={isUploading}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "#a5b4fc", background: "rgba(80,70,229,0.12)", border: "1px solid rgba(80,70,229,0.25)", borderRadius: "6px", padding: "5px 13px", cursor: isUploading ? "not-allowed" : "pointer", transition: "background 0.15s", opacity: isUploading ? 0.5 : 1 }}
            onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.background = "rgba(80,70,229,0.22)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(80,70,229,0.12)"; }}
          >
            {isUploading ? "Uploading…" : "Upload photo"}
          </button>

          {(currentUrl || localPreview) && !isUploading && (
            <button
              onClick={handleRemove}
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "5px 13px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "4px" }}
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
            <AlertCircle size={12} color="#f87171" style={{ marginTop: "1px", flexShrink: 0 }} />
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "#f87171", margin: 0 }}>{errorMsg}</p>
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
    </div>
  );
}

/* ──────────────────────── Main profile view ───────────────────────── */

export function AdminProfileView() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const displayName = user?.name ?? BRAND_NAME;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [name, setName]         = useState(displayName);
  const [username, setUsername] = useState(BRAND_HANDLE);
  const [bio, setBio]           = useState("");
  const [website, setWebsite]   = useState(`https://${BRAND_EMAIL.split("@")[1] ?? "yourdomain.dev"}`);
  const [twitter, setTwitter]   = useState("");
  const [github, setGithub]     = useState(BRAND_GITHUB);

  const updateMutation = useMutation({
    mutationFn: () =>
      usersUpdateUserMe({ body: { full_name: name } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["about"] });
      showSuccessToast("Profile saved.");
    },
    onError: () => showErrorToast("Failed to save profile."),
  });

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "12px", padding: "24px",
  };

  const sectionTitle = (t: string) => (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.0625rem", color: "#fff", margin: "0 0 12px" }}>{t}</h3>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
    </div>
  );

  const isSaving = updateMutation.isPending;
  const justSaved = updateMutation.isSuccess;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Public profile card */}
      <div style={cardStyle}>
        {sectionTitle("Public Profile")}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <AvatarUpload
            currentUrl={avatarUrl}
            name={name}
            onSaved={(url) => {
              setAvatarUrl(url);
              refreshUser();
            }}
          />
          <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Display name" value={name} onChange={setName} placeholder="Your name" maxLength={48} />
            <Field label="Username" value={username} onChange={setUsername} placeholder="your-handle" hint="yourdomain.dev/@your-handle" maxLength={32} />
          </div>
          <Field label="Bio" value={bio} onChange={setBio} placeholder="Tell readers a bit about yourself…" rows={3} maxLength={200} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Website" value={website} onChange={setWebsite} type="url" placeholder="https://yoursite.com" />
            <Field label="Twitter / X" value={twitter} onChange={setTwitter} placeholder="@handle" />
          </div>
          <Field label="GitHub" value={github} onChange={setGithub} placeholder="github-username" hint="github.com/github-username" />
        </div>
      </div>

      {/* Account info card — read-only */}
      <div style={cardStyle}>
        {sectionTitle("Account Info")}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <Field label="Email" value={user?.email ?? BRAND_EMAIL} onChange={() => {}} readOnly hint="Contact support to change." />
            <Field label="Role" value={user?.role === "admin" ? "Blog Owner (Admin)" : "Reader"} onChange={() => {}} readOnly />
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} color="#4ade80" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: "#4ade80" }}>Email verified</span>
          </div>
        </div>
      </div>

      {/* Save row */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => updateMutation.mutate()}
          disabled={isSaving}
          style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 24px", background: justSaved ? "rgba(74,222,128,0.15)" : "#5046e5", color: justSaved ? "#4ade80" : "#fff", border: justSaved ? "1px solid rgba(74,222,128,0.35)" : "none", borderRadius: "9px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, cursor: isSaving ? "default" : "pointer", transition: "all 0.2s" }}
          onMouseEnter={(e) => { if (!isSaving && !justSaved) e.currentTarget.style.background = "#4338ca"; }}
          onMouseLeave={(e) => { if (!isSaving && !justSaved) e.currentTarget.style.background = "#5046e5"; }}
        >
          {isSaving && <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
          {justSaved && <Check size={14} />}
          {isSaving ? "Saving…" : justSaved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
