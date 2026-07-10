import type { CSSProperties, ReactNode } from "react";
import { BRAND_DOMAIN, LOGO_SRC } from "../../lib/constants";

const ICON_SIZES = { sm: 28, md: 36, lg: 44 } as const;

interface BrandLogoProps {
  size?: keyof typeof ICON_SIZES;
  showText?: boolean;
  layout?: "horizontal" | "stacked";
  textStyle?: CSSProperties;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export function BrandLogo({
  size = "md",
  showText = true,
  layout = "horizontal",
  textStyle,
  style,
  className,
  children,
}: BrandLogoProps) {
  const iconSize = ICON_SIZES[size];
  const isStacked = layout === "stacked";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: isStacked ? "column" : "row",
        alignItems: "center",
        gap: isStacked ? "10px" : "10px",
        ...style,
      }}
    >
      <img
        src={LOGO_SRC}
        alt={BRAND_DOMAIN}
        width={iconSize}
        height={iconSize}
        style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
      />
      {showText && (
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: size === "lg" ? "1.375rem" : size === "sm" ? "1.125rem" : "1.25rem",
            color: "#fff",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            ...textStyle,
          }}
        >
          {BRAND_DOMAIN}
        </span>
      )}
      {children}
    </div>
  );
}
