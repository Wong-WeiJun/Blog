import type { CSSProperties } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { tagsGetTags, tagsCreateTag, tagsDeleteTag } from "@/client/sdk.gen";
import type { TagWithCountResponse } from "@/client/types.gen";
import useCustomToast from "../../../hooks/useCustomToast";

export function TagsView() {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#5046e5");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: tags = [], isLoading, isError } = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const res = await tagsGetTags();
      return (res.data ?? []) as TagWithCountResponse[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      tagsCreateTag({ body: { name: name.trim(), color } }),
    onSuccess: () => {
      showSuccessToast("Tag created.");
      setName("");
      setColor("#5046e5");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showErrorToast(typeof detail === "string" ? detail : "Failed to create tag.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tagId: string) => tagsDeleteTag({ path: { tag_id: tagId } }),
    onSuccess: () => {
      showSuccessToast("Tag deleted.");
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      showErrorToast(typeof detail === "string" ? detail : "Failed to delete tag.");
    },
  });

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Add tag form */}
      <form
        onSubmit={handleCreate}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "flex-end",
          padding: "20px",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Tag name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS"
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "9px 12px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#fff", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: "48px", height: "38px", padding: "2px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", background: "rgba(255,255,255,0.04)", cursor: "pointer" }}
          />
        </div>
        <button
          type="submit"
          disabled={!name.trim() || createMutation.isPending}
          style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: "#5046e5", border: "none", borderRadius: "8px", padding: "9px 18px", cursor: "pointer", opacity: !name.trim() || createMutation.isPending ? 0.5 : 1 }}
        >
          <Plus size={15} /> Add tag
        </button>
      </form>

      {isError && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", padding: "12px 16px", margin: 0 }}>
          Failed to load tags.
        </p>
      )}

      {/* Tags table */}
      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <th style={thStyle}>Tag</th>
                <th style={{ ...thStyle, width: "120px" }}>Posts</th>
                <th style={{ ...thStyle, width: "100px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <td key={j} style={{ padding: "16px" }}>
                        <div style={{ height: "14px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", width: j === 0 ? "120px" : "50px" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tags.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: "48px 24px", textAlign: "center", color: "rgba(255,255,255,0.35)", fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
                    No tags yet. Create one above or add tags when editing a post.
                  </td>
                </tr>
              ) : (
                tags.map((tag, idx) => {
                  const isDeleting = confirmDeleteId === tag.id;
                  return (
                    <tr
                      key={tag.id}
                      style={{ borderBottom: idx < tags.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: isDeleting ? "rgba(239,68,68,0.06)" : "transparent" }}
                    >
                      <td style={tdStyle}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem", fontWeight: 600, color: tag.color, background: `${tag.color}18`, border: `1px solid ${tag.color}35`, borderRadius: "6px", padding: "4px 12px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: tag.color, flexShrink: 0 }} />
                          {tag.name}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)" }}>
                          {tag.post_count}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "right" }}>
                        {isDeleting ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                            <AlertTriangle size={14} color="#f87171" />
                            <span style={{ fontSize: "0.75rem", color: "#f87171" }}>Delete?</span>
                            <button
                              onClick={() => deleteMutation.mutate(tag.id)}
                              disabled={deleteMutation.isPending}
                              style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fff", background: "#ef4444", border: "none", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer" }}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(tag.id)}
                            title="Delete tag"
                            style={{ color: "rgba(255,255,255,0.3)", background: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "5px", display: "inline-flex" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                          >
                            <Trash2 size={15} />
                          </button>
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
    </div>
  );
}
