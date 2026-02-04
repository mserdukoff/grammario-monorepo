import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";

interface AnimatedTextProps {
  text: string;
  startFrame?: number;
  style?: React.CSSProperties;
  className?: string;
  charDelay?: number;
  type?: "fade" | "typewriter" | "spring";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame = 0,
  style,
  className,
  charDelay = 2,
  type = "spring",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  if (relativeFrame < 0) {
    return null;
  }

  if (type === "fade") {
    const opacity = interpolate(relativeFrame, [0, 15], [0, 1], {
      extrapolateRight: "clamp",
    });
    const translateY = interpolate(relativeFrame, [0, 15], [20, 0], {
      extrapolateRight: "clamp",
    });

    return (
      <div
        className={className}
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  if (type === "typewriter") {
    const charsToShow = Math.floor(relativeFrame / charDelay);
    const visibleText = text.slice(0, charsToShow);

    return (
      <div className={className} style={style}>
        {visibleText}
        {charsToShow < text.length && (
          <span
            style={{
              opacity: Math.sin(frame * 0.3) > 0 ? 1 : 0,
              marginLeft: 2,
            }}
          >
            |
          </span>
        )}
      </div>
    );
  }

  // Spring animation (character by character)
  return (
    <div className={className} style={{ display: "flex", ...style }}>
      {text.split("").map((char, i) => {
        const charFrame = relativeFrame - i * charDelay;
        const springValue = spring({
          frame: charFrame,
          fps,
          config: {
            damping: 12,
            stiffness: 200,
            mass: 0.5,
          },
        });

        const opacity = interpolate(charFrame, [0, 5], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              opacity,
              transform: `translateY(${(1 - springValue) * 20}px)`,
              display: "inline-block",
              whiteSpace: char === " " ? "pre" : "normal",
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

interface FadeInProps {
  children: React.ReactNode;
  startFrame?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  style?: React.CSSProperties;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  startFrame = 0,
  duration = 15,
  direction = "up",
  distance = 30,
  style,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - startFrame;

  const opacity = interpolate(relativeFrame, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const getTransform = () => {
    const progress = interpolate(relativeFrame, [0, duration], [distance, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    switch (direction) {
      case "up":
        return `translateY(${progress}px)`;
      case "down":
        return `translateY(-${progress}px)`;
      case "left":
        return `translateX(${progress}px)`;
      case "right":
        return `translateX(-${progress}px)`;
      default:
        return "none";
    }
  };

  return (
    <div
      style={{
        opacity,
        transform: getTransform(),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  startFrame?: number;
  style?: React.CSSProperties;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  startFrame = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const relativeFrame = frame - startFrame;

  const scale = spring({
    frame: relativeFrame,
    fps,
    config: {
      damping: 12,
      stiffness: 150,
      mass: 0.8,
    },
  });

  const opacity = interpolate(relativeFrame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
