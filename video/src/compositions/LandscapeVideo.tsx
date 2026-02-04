import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { HookScene } from "../scenes/HookScene";
import { ProblemScene } from "../scenes/ProblemScene";
import { SolutionScene } from "../scenes/SolutionScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { CTAScene } from "../scenes/CTAScene";

/**
 * Landscape (16:9) composition for YouTube
 * 1920x1080 @ 30fps
 * Total duration: 45 seconds (1350 frames)
 * 
 * FASTER PACING:
 * - Hook: 0-3.5s (frames 0-105)
 * - Problem: 3.5-9s (frames 105-270)
 * - Solution: 9-24s (frames 270-720)
 * - Contrast: 24-35s (frames 720-1050)
 * - CTA: 35-45s (frames 1050-1350)
 */

export const LandscapeVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene timings in frames - FASTER PACING
  const HOOK_START = 0;
  const HOOK_DURATION = Math.round(3.5 * fps); // ~105 frames

  const PROBLEM_START = HOOK_START + HOOK_DURATION;
  const PROBLEM_DURATION = Math.round(5.5 * fps); // ~165 frames

  const SOLUTION_START = PROBLEM_START + PROBLEM_DURATION;
  const SOLUTION_DURATION = 15 * fps; // 450 frames

  const CONTRAST_START = SOLUTION_START + SOLUTION_DURATION;
  const CONTRAST_DURATION = 11 * fps; // 330 frames

  const CTA_START = CONTRAST_START + CONTRAST_DURATION;
  const CTA_DURATION = 10 * fps; // 300 frames

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#020617",
        position: "relative",
      }}
    >
      {/* Scene 1: Hook - "Stop guessing grammar" */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_DURATION}>
        <HookScene isPortrait={false} />
      </Sequence>

      {/* Scene 2: Problem - Boring grammar apps */}
      <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_DURATION}>
        <ProblemScene isPortrait={false} />
      </Sequence>

      {/* Scene 3: Solution - Grammario Italian demo */}
      <Sequence from={SOLUTION_START} durationInFrames={SOLUTION_DURATION}>
        <SolutionScene isPortrait={false} />
      </Sequence>

      {/* Scene 4: Contrast - German accusative case */}
      <Sequence from={CONTRAST_START} durationInFrames={CONTRAST_DURATION}>
        <ContrastScene isPortrait={false} />
      </Sequence>

      {/* Scene 5: CTA - 5 languages, sign up */}
      <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
        <CTAScene isPortrait={false} />
      </Sequence>
    </div>
  );
};
