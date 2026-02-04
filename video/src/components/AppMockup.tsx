import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface AppMockupProps {
  children: React.ReactNode;
  startFrame?: number;
  width?: number;
  height?: number;
  showBrowser?: boolean;
}

export const AppMockup: React.FC<AppMockupProps> = ({
  children,
  startFrame = 0,
  width = 1400,
  height = 800,
  showBrowser = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  const scale = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
      mass: 1,
    },
  });

  const opacity = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (relativeFrame < 0) return null;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${0.8 + scale * 0.2})`,
        transformOrigin: "center center",
      }}
    >
      <div
        style={{
          width,
          height,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.1)",
          backgroundColor: "#020617",
        }}
      >
        {/* Browser chrome */}
        {showBrowser && (
          <div
            style={{
              height: 44,
              backgroundColor: "#0f172a",
              borderBottom: "1px solid #1e293b",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 12,
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#febc2e",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "#28c840",
                }}
              />
            </div>

            {/* URL bar */}
            <div
              style={{
                flex: 1,
                height: 28,
                backgroundColor: "#1e293b",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 11, color: "#10b981" }}>🔒</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                grammario.io/app
              </span>
            </div>
          </div>
        )}

        {/* App content */}
        <div
          style={{
            height: showBrowser ? height - 44 : height,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// Navbar component for inside the app mockup
export const AppNavbar: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div
      style={{
        height: compact ? 48 : 56,
        backgroundColor: "#0f172a",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${compact ? 16 : 24}px`,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: compact ? 28 : 32,
            height: compact ? 28 : 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: compact ? 14 : 16,
            fontWeight: 700,
            color: "white",
          }}
        >
          G
        </div>
        <span
          style={{
            fontSize: compact ? 16 : 20,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
          }}
        >
          Grammario
        </span>
      </div>

      {/* Nav items */}
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>Features</span>
          <span style={{ fontSize: 14, color: "#94a3b8" }}>Pricing</span>
          <div
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              backgroundColor: "#6366f1",
              color: "white",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Sign In
          </div>
        </div>
      )}
    </div>
  );
};
