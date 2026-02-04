import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { WordToken } from "../data/sentences";

interface WordNodeProps {
  token: WordToken;
  index: number;
  startFrame?: number;
  isHighlighted?: boolean;
  showMorphology?: boolean;
  x: number;
  y: number;
}

export const WordNode: React.FC<WordNodeProps> = ({
  token,
  index,
  startFrame = 0,
  isHighlighted = false,
  showMorphology = false,
  x,
  y,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delayPerNode = 5;
  const nodeStartFrame = startFrame + index * delayPerNode;
  const relativeFrame = frame - nodeStartFrame;

  // Spring animation for entrance
  const scale = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 14,
      stiffness: 200,
      mass: 0.5,
    },
  });

  const opacity = interpolate(relativeFrame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight glow animation
  const glowIntensity = isHighlighted
    ? interpolate(Math.sin(frame * 0.12), [-1, 1], [0.5, 1])
    : 0;

  // Get POS tag color
  const getPosColor = (upos: string) => {
    const colors: Record<string, string> = {
      NOUN: "#6366f1", // indigo
      VERB: "#10b981", // emerald
      DET: "#f59e0b", // amber
      ADJ: "#ec4899", // pink
      ADV: "#8b5cf6", // violet
      PRON: "#14b8a6", // teal
      ADP: "#f97316", // orange
      CONJ: "#64748b", // slate
    };
    return colors[upos] || "#64748b";
  };

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 220,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      {/* Main card */}
      <div
        style={{
          width: "100%",
          padding: "28px 24px",
          borderRadius: 20,
          backgroundColor: "#0f172a",
          border: isHighlighted ? "4px solid #fbbf24" : "3px solid #334155",
          boxShadow: isHighlighted
            ? `0 0 ${40 * glowIntensity}px rgba(251, 191, 36, ${glowIntensity * 0.6})`
            : "0 6px 28px rgba(0, 0, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Word text */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: isHighlighted ? "#fbbf24" : "#f1f5f9",
            textAlign: "center",
          }}
        >
          {token.text}
        </div>

        {/* Lemma */}
        <div
          style={{
            fontSize: 26,
            color: "#94a3b8",
            fontStyle: "italic",
          }}
        >
          {token.lemma}
        </div>

        {/* POS tag */}
        <div
          style={{
            marginTop: 10,
            padding: "10px 22px",
            borderRadius: 10,
            backgroundColor: `${getPosColor(token.upos)}20`,
            border: `2px solid ${getPosColor(token.upos)}40`,
            color: getPosColor(token.upos),
            fontSize: 24,
            fontWeight: 600,
            fontFamily: "monospace",
            letterSpacing: "0.03em",
          }}
        >
          {token.upos}
        </div>
      </div>
    </div>
  );
};
