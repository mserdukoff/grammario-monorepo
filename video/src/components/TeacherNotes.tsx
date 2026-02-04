import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import type { PedagogicalData } from "../data/sentences";

interface TeacherNotesProps {
  data: PedagogicalData;
  startFrame?: number;
  compact?: boolean;
}

export const TeacherNotes: React.FC<TeacherNotesProps> = ({
  data,
  startFrame = 0,
  compact = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // Panel slide up animation
  const slideY = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 15,
      stiffness: 100,
      mass: 0.8,
    },
  });

  const opacity = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered content animations
  const translationOpacity = interpolate(relativeFrame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const conceptsOpacity = interpolate(relativeFrame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (relativeFrame < 0) return null;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - slideY) * 50}px)`,
        padding: compact ? 16 : 24,
        backgroundColor: "#022c2280",
        borderRadius: 16,
        border: "1px solid #10b98130",
        backdropFilter: "blur(10px)",
        maxWidth: compact ? 400 : 500,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: compact ? 12 : 20,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: "#10b98120",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          📚
        </div>
        <span
          style={{
            fontSize: compact ? 16 : 20,
            fontWeight: 600,
            color: "#10b981",
          }}
        >
          Teacher's Notes
        </span>
      </div>

      {/* Translation */}
      <div
        style={{
          opacity: translationOpacity,
          marginBottom: compact ? 12 : 20,
          padding: compact ? 12 : 16,
          backgroundColor: "#10b98110",
          borderRadius: 10,
          border: "1px solid #10b98120",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#34d399",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          Translation
        </div>
        <div
          style={{
            fontSize: compact ? 14 : 16,
            color: "#e2e8f0",
            fontStyle: "italic",
          }}
        >
          "{data.translation}"
        </div>
        {data.nuance && !compact && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.5,
            }}
          >
            {data.nuance}
          </div>
        )}
      </div>

      {/* Concepts */}
      <div style={{ opacity: conceptsOpacity }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#fbbf24",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>💡</span> Key Concepts
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.concepts.slice(0, compact ? 1 : 2).map((concept, i) => (
            <div
              key={i}
              style={{
                padding: compact ? 10 : 14,
                backgroundColor: "#0f172a80",
                borderRadius: 8,
                border: "1px solid #33415540",
              }}
            >
              <div
                style={{
                  fontSize: compact ? 13 : 15,
                  fontWeight: 600,
                  color: "#a5b4fc",
                  marginBottom: 6,
                }}
              >
                {concept.name}
              </div>
              <div
                style={{
                  fontSize: compact ? 11 : 13,
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                }}
              >
                {concept.description}
              </div>
              {!compact && concept.relatedWords.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {concept.relatedWords.map((word, j) => (
                    <span
                      key={j}
                      style={{
                        padding: "3px 10px",
                        borderRadius: 4,
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        color: "#94a3b8",
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
