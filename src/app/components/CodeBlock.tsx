import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  filename?: string;
  language?: string;
  code: string;
}

export function CodeBlock({ filename, language = "bash", code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Very light syntax coloring — just enough to feel real
  const colorize = (line: string) => {
    // Comment
    if (line.trimStart().startsWith("#") || line.trimStart().startsWith("//")) {
      return <span style={{ color: "#6b7280" }}>{line}</span>;
    }
    // String detection: wrap quoted values
    const parts = line.split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);
    return parts.map((part, i) => {
      if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        return <span key={i} style={{ color: "#6ee7b7" }}>{part}</span>;
      }
      // Keywords
      const kw = part.replace(
        /\b(resource|variable|output|module|provider|terraform|locals|data|for_each|count|source|version|backend|required_providers|true|false|null|var\.|local\.|aws_|google_|azurerm_)\b/g,
        (m) => `\x01${m}\x01`
      );
      return kw.split("\x01").map((seg, j) =>
        j % 2 === 1
          ? <span key={`${i}-${j}`} style={{ color: "#a5b4fc" }}>{seg}</span>
          : <span key={`${i}-${j}`}>{seg}</span>
      );
    });
  };

  return (
    <div
      style={{
        background: "#0d0f1e",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        marginBlock: "24px",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* macOS header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
              <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
            ))}
          </div>
          {filename && (
            <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>
              {filename}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {language && (
            <span style={{ fontSize: "0.65rem", color: "rgba(165,180,252,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {language}
            </span>
          )}
          <button
            onClick={handleCopy}
            title="Copy"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "5px",
              padding: "3px 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: copied ? "#6ee7b7" : "rgba(255,255,255,0.4)",
              fontSize: "0.68rem",
              transition: "color 0.15s",
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code body */}
      <pre
        style={{
          margin: 0,
          padding: "20px 20px",
          overflowX: "auto",
          fontSize: "0.8125rem",
          lineHeight: 1.75,
          color: "rgba(255,255,255,0.75)",
          tabSize: 2,
        }}
      >
        <code>
          {code.split("\n").map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "16px", minHeight: "1.75em" }}>
              <span style={{ userSelect: "none", color: "rgba(255,255,255,0.18)", minWidth: "24px", textAlign: "right", flexShrink: 0 }}>
                {i + 1}
              </span>
              <span>{colorize(line)}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

/* Inline code component */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.82em",
        color: "#a5b4fc",
        background: "rgba(80,70,229,0.12)",
        border: "1px solid rgba(80,70,229,0.22)",
        borderRadius: "5px",
        padding: "1px 6px",
        verticalAlign: "baseline",
      }}
    >
      {children}
    </code>
  );
}
