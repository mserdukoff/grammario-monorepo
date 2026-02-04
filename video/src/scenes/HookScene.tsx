import React from "react";
import { useCurrentFrame, interpolate, useVideoConfig } from "remotion";

interface HookSceneProps {
  startFrame?: number;
  isPortrait?: boolean;
}

export const HookScene: React.FC<HookSceneProps> = ({
  startFrame = 0,
  isPortrait = false,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Background pulse animation
  const pulseIntensity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.08, 0.2]
  );

  // Line 1: "What if you could" - gentle fade in
  const line1Opacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Line 2: "see grammar?" - gentle fade in after line 1
  const line2Opacity = interpolate(frame, [30, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at the end
  const fadeOut = interpolate(frame, [85, 105], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: "#020617",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        opacity: fadeOut,
      }}
    >
      {/* Background radial gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, rgba(99, 102, 241, ${pulseIntensity}) 0%, transparent 70%)`,
        }}
      />

      {/* Main text container */}
      <div
        style={{
          textAlign: "center",
          padding: isPortrait ? 40 : 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Line 1 */}
        <div
          style={{
            fontSize: isPortrait ? 48 : 64,
            fontWeight: 500,
            color: "#94a3b8",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            opacity: line1Opacity,
          }}
        >
          What if you could
        </div>

        {/* Line 2 */}
        <div
          style={{
            fontSize: isPortrait ? 96 : 140,
            fontWeight: 800,
            background:
              "linear-gradient(135deg, #6366f1 0%, #22d3ee 50%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginTop: 12,
            opacity: line2Opacity,
          }}
        >
          see grammar?
        </div>
      </div>
    </div>
  );
};
