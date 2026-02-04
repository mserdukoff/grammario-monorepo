import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { SentenceFlow } from "../components/SentenceFlow";
import { AnimatedText } from "../components/AnimatedText";
import { italianSentence } from "../data/sentences";

interface SolutionSceneProps {
  startFrame?: number;
  isPortrait?: boolean;
}

export const SolutionScene: React.FC<SolutionSceneProps> = ({
  startFrame = 0,
  isPortrait = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // Fade in
  const fadeIn = interpolate(relativeFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at the end - FASTER
  const fadeOut = interpolate(relativeFrame, [400, 450], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo reveal timing - FASTER
  const logoScale = spring({
    frame: relativeFrame - 10,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const logoOpacity = interpolate(relativeFrame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Sentence reveal - FASTER
  const sentenceOpacity = interpolate(relativeFrame, [40, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Flow visualization starts after sentence - FASTER
  const flowStartFrame = startFrame + 70;

  // Teacher notes timing - FASTER
  const notesOpacity = interpolate(relativeFrame, [180, 200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (isPortrait) {
    // Phase 1: Show logo + sentence (frames 0-120)
    const phase1Opacity = interpolate(relativeFrame, [0, 20, 100, 120], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Phase 2: Show cards (frames 110-230)
    const phase2Opacity = interpolate(relativeFrame, [110, 130, 210, 230], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const flowStartFramePortrait = startFrame + 115;

    // Phase 3: Teacher's notes (frames 220-end)
    const phase3Opacity = interpolate(relativeFrame, [220, 250], [0, 1], {
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
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
          }}
        />

        {/* PHASE 1: Logo + Sentence */}
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
          {/* Logo */}
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 160,
              height: 160,
              borderRadius: 36,
              marginBottom: 28,
              boxShadow: "0 0 80px rgba(99, 102, 241, 0.5)",
            }}
          />
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#f1f5f9",
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Grammario
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#64748b",
              marginBottom: 80,
            }}
          >
            See how sentences work
          </div>

          {/* Sentence */}
          <div
            style={{
              fontSize: 36,
              color: "#64748b",
              marginBottom: 20,
            }}
          >
            🇮🇹 Italian
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 600,
              color: "#f1f5f9",
              textAlign: "center",
              padding: "0 60px",
            }}
          >
            "{italianSentence.text}"
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
            sentence={italianSentence}
            startFrame={flowStartFramePortrait}
            width={800}
            height={1200}
            scale={1}
            showArrows={false}
            layout="vertical"
          />
        </div>

        {/* PHASE 3: Teacher's Notes */}
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
            padding: "0 50px",
          }}
        >
          <div
            style={{
              padding: 48,
              backgroundColor: "#10b98115",
              border: "3px solid #10b98130",
              borderRadius: 28,
              width: "100%",
              maxWidth: 900,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 20,
                marginBottom: 36,
              }}
            >
              <span style={{ fontSize: 52 }}>📚</span>
              <span style={{ fontSize: 48, fontWeight: 600, color: "#10b981" }}>
                Teacher's Notes
              </span>
            </div>
            <div
              style={{
                fontSize: 40,
                color: "#e2e8f0",
                fontStyle: "italic",
                marginBottom: 32,
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              "{italianSentence.pedagogicalData.translation}"
            </div>
            <div
              style={{
                fontSize: 32,
                color: "#94a3b8",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              {italianSentence.pedagogicalData.concepts[0].description}
            </div>
          </div>

          {/* Key concept highlight */}
          <div
            style={{
              marginTop: 50,
              padding: "32px 48px",
              backgroundColor: "#6366f115",
              border: "3px solid #6366f130",
              borderRadius: 20,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "#6366f1",
                textAlign: "center",
              }}
            >
              💡 {italianSentence.pedagogicalData.concepts[0].name}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landscape layout - Sequential phases
  // Phase 1: Show logo + sentence (frames 0-120)
  const phase1OpacityLandscape = interpolate(relativeFrame, [0, 20, 100, 120], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 2: Show cards (frames 110-260)
  const phase2OpacityLandscape = interpolate(relativeFrame, [110, 130, 240, 260], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flowStartFrameLandscape = startFrame + 115;

  // Phase 3: Teacher's notes (frames 250-end)
  const phase3OpacityLandscape = interpolate(relativeFrame, [250, 280], [0, 1], {
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
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* PHASE 1: Logo + Sentence */}
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
        {/* Logo */}
        <Img
          src={staticFile("logo.png")}
          style={{
            width: 180,
            height: 180,
            borderRadius: 40,
            marginBottom: 32,
            boxShadow: "0 0 100px rgba(99, 102, 241, 0.5)",
          }}
        />
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#f1f5f9",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Grammario
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#64748b",
            marginBottom: 60,
          }}
        >
          See how sentences work
        </div>

        {/* Sentence */}
        <div
          style={{
            fontSize: 32,
            color: "#64748b",
            marginBottom: 16,
          }}
        >
          🇮🇹 Italian
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#f1f5f9",
            textAlign: "center",
          }}
        >
          "{italianSentence.text}"
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
          sentence={italianSentence}
          startFrame={flowStartFrameLandscape}
          width={1800}
          height={400}
          scale={1}
          showArrows={false}
          layout="horizontal"
        />
      </div>

      {/* PHASE 3: Teacher's Notes */}
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
        <div
          style={{
            padding: 60,
            backgroundColor: "#10b98112",
            border: "3px solid #10b98125",
            borderRadius: 32,
            maxWidth: 1400,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              marginBottom: 40,
            }}
          >
            <span style={{ fontSize: 56 }}>📚</span>
            <span style={{ fontSize: 52, fontWeight: 600, color: "#10b981" }}>
              Teacher's Notes
            </span>
          </div>
          <div
            style={{
              fontSize: 44,
              color: "#e2e8f0",
              fontStyle: "italic",
              marginBottom: 32,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            "{italianSentence.pedagogicalData.translation}"
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#94a3b8",
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            {italianSentence.pedagogicalData.concepts[0].description}
          </div>
        </div>

        {/* Key concept highlight */}
        <div
          style={{
            marginTop: 50,
            padding: "28px 56px",
            backgroundColor: "#6366f115",
            border: "3px solid #6366f130",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: "#6366f1",
              textAlign: "center",
            }}
          >
            💡 {italianSentence.pedagogicalData.concepts[0].name}
          </div>
        </div>
      </div>
    </div>
  );
};
