import type { CSSProperties, FormEvent } from "react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import {
  projectsGetProjects,
  projectsCreateProject,
  projectsUpdateProject,
  projectsDeleteProject,
} from "@/client/sdk.gen";
import type { ProjectResponse, ProjectStatus } from "@/client/types.gen";
import useCustomToast from "../../../hooks/useCustomToast";
import { uploadCoverImage } from "../../../lib/upload-image";

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
  { value: "archived", label: "Archived" },
];

const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  archived: "Archived",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  completed: "#4ade80",
  in_progress: "#fbbf24",
  archived: "#94a3b8",
};

interface FormState {
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  accent: string;
  stack: string[];
  github_url: string;
  live_url: string;
  cover_image_url: string | null;
  stars: number;
  forks: number;
  sort_order: number;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "Open Source",
  status: "in_progress",
  accent: "#5046e5",
  stack: [],
  github_url: "",
  live_url: "",
  cover_image_url: null,
  stars: 0,
  forks: 0,
  sort_order: 0,
};

function projectToForm(p: ProjectResponse): FormState {
  return {
    title: p.title,
    description: p.description,
    category: p.category,
    status: p.status,
    accent: p.accent,
    stack: [...p.stack],
    github_url: p.github_url ?? "",
    live_url: p.live_url ?? "",
    cover_image_url: p.cover_image_url,
    stars: p.stars,
    forks: p.forks,
    sort_order: p.sort_order,
  };
}

function formToBody(form: FormState) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    status: form.status,
    accent: form.accent,
    stack: form.stack,
    github_url: form.github_url.trim() || null,
    live_url: form.live_url.trim() || null,
    cover_image_url: form.cover_image_url,
    stars: form.stars,
    forks: form.forks,
    sort_order: form.sort_order,
  };
}

interface Props {
  search: string;
  onNewProject?: () => void;
  newProjectTrigger?: number;
}

export function ProjectsView({ search, newProjectTrigger = 0 }: Props) {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectResponse | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [stackInput, setStackInput] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newProjectTrigger > 0) {
      setEditing(null);
      setForm(EMPTY_FORM);
      setStackInput("");
      setModalOpen(true);
    }
  }, [newProjectTrigger]);

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const res = await projectsGetProjects();
      return (res.data ?? []) as ProjectResponse[];
    },
  });

  const filtered = projects.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.stack.some((t) => t.toLowerCase().includes(q))
    );
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const createMutation = useMutation({
    mutationFn: () => projectsCreateProject({ body: formToBody(form) }),
    onSuccess: () => {
      showSuccessToast("Project created.");
      setModalOpen(false);
      invalidate();
    },
    onError: () => showErrorToast("Failed to create project."),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      projectsUpdateProject({ path: { project_id: id }, body: formToBody(form) }),
    onSuccess: () => {
      showSuccessToast("Project updated.");
      setModalOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: () => showErrorToast("Failed to update project."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsDeleteProject({ path: { project_id: id } }),
    onSuccess: () => {
      showSuccessToast("Project deleted.");
      setConfirmDeleteId(null);
      invalidate();
    },
    onError: () => showErrorToast("Failed to delete project."),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setStackInput("");
    setModalOpen(true);
  };

  const openEdit = (project: ProjectResponse) => {
    setEditing(project);
    setForm(projectToForm(project));
    setStackInput("");
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) return;
    if (editing) updateMutation.mutate(editing.id);
    else createMutation.mutate();
  };

  const addStack = (value: string) => {
    const val = value.trim();
    if (val && !form.stack.includes(val)) {
      setForm((f) => ({ ...f, stack: [...f.stack, val] }));
    }
    setStackInput("");
  };

  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast("Image must be under 10 MB.");
      return;
    }
    setCoverUploading(true);
    try {
      const url = await uploadCoverImage(file);
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch {
      showErrorToast("Failed to upload cover image.");
    } finally {
      setCoverUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const thStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    padding: "11px 16px",
    textAlign: "left",
  };
  const tdStyle: CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.75)",
    padding: "14px 16px",
    verticalAlign: "middle",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "9px 12px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.875rem",
    color: "#fff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    fontFamily: "'Inter', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
          {isLoading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}${search ? ` matching "${search}"` : ""}`}
        </p>
        <button
          onClick={openCreate}
          style={{ display: "flex", alignItems: "center", gap: "5px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 500, color: "#fff", background: "#5046e5", border: "none", borderRadius: "7px", padding: "6px 14px", cursor: "pointer" }}
        >
          <Plus size={13} /> New Project
        </button>
      </div>

      {isError && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "12px 16px", margin: 0 }}>
          Failed to load projects.
        </p>
      )}

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th style={thStyle}>Title</th>
                <th style={{ ...thStyle, width: "120px" }}>Category</th>
                <th style={{ ...thStyle, width: "120px" }}>Status</th>
                <th style={{ ...thStyle, width: "80px" }}>Stars</th>
                <th style={{ ...thStyle, width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={{ padding: "16px" }}>
                        <div style={{ height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", width: j === 0 ? "180px" : "60px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "48px 24px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
                    {search ? "No projects match your search." : "No projects yet. Add your first project."}
                  </td>
                </tr>
              ) : (
                filtered.map((project, idx) => {
                  const isDeleting = confirmDeleteId === project.id;
                  const statusColor = STATUS_COLORS[project.status];
                  return (
                    <tr key={project.id} style={{ borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isDeleting ? "rgba(239,68,68,0.06)" : "transparent" }}>
                      <td style={tdStyle}>
                        <span style={{ color: "#fff", fontWeight: 500 }}>{project.title}</span>
                        <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
                          order: {project.sort_order}
                        </span>
                      </td>
                      <td style={tdStyle}>{project.category}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}30`, borderRadius: "6px", padding: "3px 9px" }}>
                          {STATUS_LABELS[project.status]}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem" }}>{project.stars}</span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {isDeleting ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                            <AlertTriangle size={14} color="#f87171" />
                            <button onClick={() => deleteMutation.mutate(project.id)} style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff", background: "#ef4444", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}>Yes</button>
                            <button onClick={() => setConfirmDeleteId(null)} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer" }}>No</button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                            <button onClick={() => openEdit(project)} title="Edit" style={{ color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}>
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(project.id)} title="Delete" style={{ color: "rgba(255,255,255,0.35)", background: "transparent", border: "none", cursor: "pointer", padding: "4px" }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={() => !isSaving && setModalOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", background: "#0f1124", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "28px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>
                {editing ? "Edit project" : "New project"}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value} style={{ background: "#0f1124" }}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Accent color</label>
                  <input type="color" value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} style={{ ...inputStyle, height: "38px", padding: "2px" }} />
                </div>
                <div>
                  <label style={labelStyle}>Stars</label>
                  <input type="number" min={0} value={form.stars} onChange={(e) => setForm((f) => ({ ...f, stars: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Forks</label>
                  <input type="number" min={0} value={form.forks} onChange={(e) => setForm((f) => ({ ...f, forks: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Tech stack</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                  {form.stack.map((tech) => (
                    <span key={tech} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.75rem", fontWeight: 600, color: "#a5b4fc", background: "rgba(80,70,229,0.15)", border: "1px solid rgba(80,70,229,0.3)", borderRadius: "6px", padding: "3px 8px" }}>
                      {tech}
                      <button type="button" onClick={() => setForm((f) => ({ ...f, stack: f.stack.filter((t) => t !== tech) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#a5b4fc", padding: 0, display: "flex" }}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addStack(stackInput); } }}
                  placeholder="Add tech (Enter to confirm)"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Cover image</label>
                {form.cover_image_url ? (
                  <div style={{ position: "relative", borderRadius: "9px", overflow: "hidden", aspectRatio: "16/9", marginBottom: "8px" }}>
                    <img src={form.cover_image_url} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, cover_image_url: null }))}
                      style={{ position: "absolute", top: "8px", right: "8px", width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={coverUploading}
                    style={{ width: "100%", aspectRatio: "16/9", borderRadius: "9px", border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)", cursor: coverUploading ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem" }}
                  >
                    {coverUploading ? <><Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Uploading…</> : "Upload cover image"}
                  </button>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: "6px 0 0" }}>
                  Optional. Falls back to accent gradient if not set.
                </p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>GitHub URL</label>
                  <input value={form.github_url} onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/…" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Live demo URL</label>
                  <input value={form.live_url} onChange={(e) => setForm((f) => ({ ...f, live_url: e.target.value }))} placeholder="https://…" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Sort order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} style={{ ...inputStyle, maxWidth: "120px" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "9px 18px", cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", opacity: isSaving ? 0.6 : 1 }}>
                  {isSaving ? "Saving…" : editing ? "Save changes" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
