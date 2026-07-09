import type { CSSProperties } from "react";
import { BRAND_NAME } from "../../lib/constants";

interface ProfileAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  fontSize?: string;
  style?: CSSProperties;
  className?: string;
  showImageFull?: boolean;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  size = 80,
  fontSize,
  style,
  className,
  showImageFull = false,
}: ProfileAvatarProps) {
  const displayName = name || BRAND_NAME;
  const initial = displayName[0]?.toUpperCase() ?? "Y";
  const computedFontSize = fontSize ?? `${Math.round(size * 0.35)}px`;

  if (avatarUrl && showImageFull) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "inherit",
          ...style,
        }}
      />
    );
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid rgba(80,70,229,0.6)",
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(80,70,229,0.4)",
        border: "2px solid rgba(80,70,229,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: computedFontSize,
          fontWeight: 700,
          color: "#a5b4fc",
        }}
      >
        {initial}
      </span>
    </div>
  );
}
