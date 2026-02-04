import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { SentenceFlow } from "../components/SentenceFlow";
import { germanSentence } from "../data/sentences";

interface ContrastSceneProps {
  startFrame?: number;
  isPortrait?: boolean;
}

export const ContrastScene: React.FC<ContrastSceneProps> = ({
  startFrame = 0,
  isPortrait = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // Fade in - FASTER
  const fadeIn = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out - FASTER
  const fadeOut = interpolate(relativeFrame, [280, 330], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Header timing - FASTER
  const headerOpacity = interpolate(relativeFrame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flow starts after header - FASTER
  const flowStartFrame = startFrame + 30;

  // Highlight "den" after nodes appear
  const highlightDen = relativeFrame > 70;

  // Explanation timing - FASTER
  const explainOpacity = interpolate(relativeFrame, [100, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (isPortrait) {
    // Phase 1: Show header + sentence (frames 0-80)
    const phase1Opacity = interpolate(relativeFrame, [0, 20, 70, 90], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Phase 2: Show cards (frames 80-180)
    const phase2Opacity = interpolate(relativeFrame, [80, 100, 160, 180], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const flowStartFramePortrait = startFrame + 85;

    // Phase 3: Highlight "den" + explanation (frames 170-end)
    const phase3Opacity = interpolate(relativeFrame, [170, 190], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const showHighlight = relativeFrame > 175;

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
        {/* Background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 100% 50% at 50% 20%, rgba(251, 191, 36, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* PHASE 1: Header + Sentence */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase1Opacity,
          }}
        >
          <div
            style={{
              fontSize: 40,
              color: "#64748b",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Now the same sentence in
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 700,
              color: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              marginBottom: 60,
            }}
          >
            <span>🇩🇪</span> German
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: "#e2e8f0",
              textAlign: "center",
              padding: "0 60px",
            }}
          >
            "{germanSentence.text}"
          </div>
        </div>

        {/* PHASE 2: Word Cards */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase2Opacity,
          }}
        >
          <SentenceFlow
            sentence={germanSentence}
            startFrame={flowStartFramePortrait}
            width={800}
            height={1200}
            scale={1}
            showArrows={false}
            layout="vertical"
          />
        </div>

        {/* PHASE 3: Highlight "den" + Explanation */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: phase3Opacity,
          }}
        >
          {/* Highlighted "den" card */}
          <div
            style={{
              padding: "36px 60px",
              backgroundColor: "#0f172a",
              border: "4px solid #fbbf24",
              borderRadius: 24,
              boxShadow: "0 0 60px rgba(251, 191, 36, 0.4)",
              marginBottom: 80,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: "#fbbf24",
                textAlign: "center",
              }}
            >
              den
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#94a3b8",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: 12,
              }}
            >
              the (accusative)
            </div>
            <div
              style={{
                marginTop: 16,
                padding: "12px 28px",
                backgroundColor: "#6366f120",
                border: "2px solid #6366f140",
                borderRadius: 12,
                color: "#6366f1",
                fontSize: 28,
                fontWeight: 600,
                fontFamily: "monospace",
                textAlign: "center",
              }}
            >
              DET
            </div>
          </div>

          {/* Explanation */}
          <div
            style={{
              padding: 48,
              backgroundColor: "#fbbf2410",
              border: "3px solid #fbbf2430",
              borderRadius: 28,
              textAlign: "center",
              marginLeft: 50,
              marginRight: 50,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <span style={{ fontSize: 52 }}>💡</span>
              <span style={{ fontSize: 48, fontWeight: 700, color: "#fbbf24" }}>
                Accusative Case
              </span>
            </div>
            <div
              style={{
                fontSize: 36,
                color: "#e2e8f0",
                lineHeight: 1.5,
                marginBottom: 36,
              }}
            >
              The article changes when it's the direct object
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 48,
                padding: "28px 48px",
                backgroundColor: "#0f172a",
                borderRadius: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, color: "#64748b", marginBottom: 12 }}>
                  Subject
                </div>
                <div style={{ fontSize: 64, fontWeight: 700, color: "#94a3b8" }}>
                  der
                </div>
              </div>
              <div style={{ fontSize: 52, color: "#64748b" }}>→</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, color: "#fbbf24", marginBottom: 12 }}>
                  Object
                </div>
                <div style={{ fontSize: 64, fontWeight: 700, color: "#fbbf24" }}>
                  den
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landscape layout - Sequential phases
  // Phase 1: Show header + sentence (frames 0-80)
  const phase1OpacityLandscape = interpolate(relativeFrame, [0, 20, 70, 90], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Show cards (frames 80-180)
  const phase2OpacityLandscape = interpolate(relativeFrame, [80, 100, 160, 180], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flowStartFrameLandscape = startFrame + 85;

  // Phase 3: Highlight "den" + explanation (frames 170-end)
  const phase3OpacityLandscape = interpolate(relativeFrame, [170, 190], [0, 1], {
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
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251, 191, 36, 0.08) 0%, transparent 70%)",
        }}
      />

      {/* PHASE 1: Header + Sentence */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase1OpacityLandscape,
        }}
      >
        <div
          style={{
            fontSize: 40,
            color: "#64748b",
            marginBottom: 24,
          }}
        >
          Now the same sentence in
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            color: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
            marginBottom: 48,
          }}
        >
          <span>🇩🇪</span> German
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#e2e8f0",
            textAlign: "center",
          }}
        >
          "{germanSentence.text}"
        </div>
      </div>

      {/* PHASE 2: Word Cards (horizontal) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase2OpacityLandscape,
        }}
      >
        <SentenceFlow
          sentence={germanSentence}
          startFrame={flowStartFrameLandscape}
          width={1800}
          height={400}
          scale={1}
          showArrows={false}
          layout="horizontal"
        />
      </div>

      {/* PHASE 3: Highlight "den" + Explanation */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: phase3OpacityLandscape,
        }}
      >
        {/* Highlighted "den" card */}
        <div
          style={{
            padding: "48px 80px",
            backgroundColor: "#0f172a",
            border: "5px solid #fbbf24",
            borderRadius: 32,
            boxShadow: "0 0 80px rgba(251, 191, 36, 0.4)",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#fbbf24",
              textAlign: "center",
            }}
          >
            den
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#94a3b8",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 16,
            }}
          >
            the (accusative)
          </div>
          <div
            style={{
              marginTop: 20,
              padding: "14px 32px",
              backgroundColor: "#6366f120",
              border: "2px solid #6366f140",
              borderRadius: 14,
              color: "#6366f1",
              fontSize: 32,
              fontWeight: 600,
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            DET
          </div>
        </div>

        {/* Explanation */}
        <div
          style={{
            padding: 56,
            backgroundColor: "#fbbf2410",
            border: "3px solid #fbbf2430",
            borderRadius: 28,
            display: "flex",
            alignItems: "center",
            gap: 80,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 52 }}>💡</span>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "#fbbf24",
                }}
              >
                Accusative Case
              </span>
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#e2e8f0",
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              The article changes when the noun is the direct object of the sentence
            </div>
          </div>

          {/* Visual transformation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 48,
              padding: "36px 60px",
              backgroundColor: "#0f172a",
              borderRadius: 24,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: "#64748b", marginBottom: 14 }}>
                Subject form
              </div>
              <div style={{ fontSize: 72, fontWeight: 700, color: "#94a3b8" }}>
                der
              </div>
            </div>

            <div style={{ fontSize: 56, color: "#64748b" }}>→</div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: "#fbbf24", marginBottom: 14 }}>
                Object form
              </div>
              <div style={{ fontSize: 72, fontWeight: 700, color: "#fbbf24" }}>
                den
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
