import { Wrench } from "lucide-react";

export function PlaceholderView({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "360px", gap: "14px", opacity: 0.5 }}>
      <Wrench size={36} color="rgba(255,255,255,0.3)" />
      <p style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.125rem", color: "rgba(255,255,255,0.55)", margin: 0 }}>
        {label} coming soon
      </p>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
        This view is being built part-by-part.
      </p>
    </div>
  );
}
