import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface ProblemSceneProps {
  startFrame?: number;
  isPortrait?: boolean;
}

export const ProblemScene: React.FC<ProblemSceneProps> = ({
  startFrame = 0,
  isPortrait = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // Fade in/out - FASTER
  const fadeIn = interpolate(relativeFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(relativeFrame, [130, 165], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Text cards animation - FASTER
  const card1Opacity = interpolate(relativeFrame, [10, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card2Opacity = interpolate(relativeFrame, [25, 37], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const card3Opacity = interpolate(relativeFrame, [40, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom text - FASTER
  const bottomTextOpacity = interpolate(relativeFrame, [70, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const examples = [
    { word: "mangia", label: "verb", question: "Which conjugation?" },
    { word: "il", label: "article", question: "Why not 'lo'?" },
    { word: "den", label: "article", question: "Why not 'der'?" },
  ];

  const cardOpacities = [card1Opacity, card2Opacity, card3Opacity];

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
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Header text */}
      <div
        style={{
          position: "absolute",
          top: isPortrait ? 160 : 70,
          textAlign: "center",
          opacity: interpolate(relativeFrame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div
          style={{
            fontSize: isPortrait ? 52 : 72,
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          Most apps just tell you
        </div>
      </div>

      {/* Word cards */}
      <div
        style={{
          display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          gap: isPortrait ? 36 : 64,
          alignItems: "center",
        }}
      >
        {examples.map((ex, i) => (
          <div
            key={i}
            style={{
              opacity: cardOpacities[i],
              transform: `translateY(${(1 - cardOpacities[i]) * 20}px)`,
            }}
          >
            <div
              style={{
                width: isPortrait ? 400 : 360,
                padding: isPortrait ? 36 : 44,
                backgroundColor: "#1e293b",
                borderRadius: 20,
                border: "2px solid #334155",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: isPortrait ? 56 : 68,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 16,
                }}
              >
                {ex.word}
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "10px 24px",
                  backgroundColor: "#475569",
                  borderRadius: 10,
                  fontSize: isPortrait ? 24 : 26,
                  fontWeight: 600,
                  color: "#94a3b8",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}
              >
                {ex.label}
              </div>
              <div
                style={{
                  marginTop: 20,
                  fontSize: isPortrait ? 24 : 26,
                  color: "#64748b",
                  fontStyle: "italic",
                }}
              >
                {ex.question}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom text */}
      <div
        style={{
          position: "absolute",
          bottom: isPortrait ? 200 : 80,
          textAlign: "center",
          opacity: bottomTextOpacity,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            fontSize: isPortrait ? 48 : 64,
            fontWeight: 600,
            color: "#f1f5f9",
          }}
        >
          ...but never show you <span style={{ color: "#6366f1" }}>why</span>
        </div>
      </div>
    </div>
  );
};
