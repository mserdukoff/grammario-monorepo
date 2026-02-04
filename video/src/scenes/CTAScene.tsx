import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { supportedLanguages } from "../data/sentences";

interface CTASceneProps {
  startFrame?: number;
  isPortrait?: boolean;
}

export const CTAScene: React.FC<CTASceneProps> = ({
  startFrame = 0,
  isPortrait = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  // Fade in
  const fadeIn = interpolate(relativeFrame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logo animation
  const logoScale = spring({
    frame: relativeFrame - 10,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Flags stagger animation
  const flagsBaseDelay = 30;

  // Tagline timing
  const taglineOpacity = interpolate(relativeFrame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA button timing
  const buttonScale = spring({
    frame: relativeFrame - 90,
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  const buttonOpacity = interpolate(relativeFrame, [90, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL timing
  const urlOpacity = interpolate(relativeFrame, [110, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle pulse animation for button
  const buttonPulse =
    relativeFrame > 110 ? Math.sin((relativeFrame - 110) * 0.08) * 0.02 : 0;

  if (isPortrait) {
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
          opacity: fadeIn,
        }}
      >
        {/* Background gradients */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 100% 60% at 50% 30%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 40% at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            marginBottom: 60,
          }}
        >
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 160,
              height: 160,
              borderRadius: 36,
              boxShadow: "0 0 100px rgba(99, 102, 241, 0.5)",
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            textAlign: "center",
            padding: "0 50px",
            marginBottom: 70,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            See grammar clearly
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#94a3b8",
            }}
          >
            in 5 languages
          </div>
        </div>

        {/* Language flags */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginBottom: 80,
          }}
        >
          {supportedLanguages.map((lang, i) => {
            const delay = flagsBaseDelay + i * 6;
            const flagScale = spring({
              frame: relativeFrame - delay,
              fps,
              config: { damping: 10, stiffness: 150 },
            });
            const flagOpacity = interpolate(
              relativeFrame - delay,
              [0, 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={lang.code}
                style={{
                  opacity: flagOpacity,
                  transform: `scale(${flagScale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 72,
                  }}
                >
                  {lang.flag}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {lang.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div
          style={{
            opacity: buttonOpacity,
            transform: `scale(${buttonScale * (1 + buttonPulse)})`,
          }}
        >
          <div
            style={{
              padding: "26px 72px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: 60,
              fontSize: 36,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 0 60px rgba(99, 102, 241, 0.4)",
            }}
          >
            Try it free
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 140,
            opacity: urlOpacity,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.05em",
            }}
          >
            grammario.ai
          </div>
        </div>
      </div>
    );
  }

  // Landscape layout
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
        opacity: fadeIn,
      }}
    >
      {/* Background gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 80% at 50% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
          }}
        >
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 180,
              height: 180,
              borderRadius: 40,
              boxShadow: "0 0 120px rgba(99, 102, 241, 0.5)",
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: taglineOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: 16,
            }}
          >
            See grammar clearly
          </div>
          <div
            style={{
              fontSize: 42,
              color: "#94a3b8",
            }}
          >
            in 5 languages
          </div>
        </div>

        {/* Language flags */}
        <div
          style={{
            display: "flex",
            gap: 64,
          }}
        >
          {supportedLanguages.map((lang, i) => {
            const delay = flagsBaseDelay + i * 6;
            const flagScale = spring({
              frame: relativeFrame - delay,
              fps,
              config: { damping: 10, stiffness: 150 },
            });
            const flagOpacity = interpolate(
              relativeFrame - delay,
              [0, 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                key={lang.code}
                style={{
                  opacity: flagOpacity,
                  transform: `scale(${flagScale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 88,
                  }}
                >
                  {lang.flag}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  {lang.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button and URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            marginTop: 28,
          }}
        >
          <div
            style={{
              opacity: buttonOpacity,
              transform: `scale(${buttonScale * (1 + buttonPulse)})`,
            }}
          >
            <div
              style={{
                padding: "28px 88px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                borderRadius: 70,
                fontSize: 40,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 0 80px rgba(99, 102, 241, 0.4)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              Try it free
            </div>
          </div>

          <div
            style={{
              opacity: urlOpacity,
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: "0.05em",
              }}
            >
              grammario.ai
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
