import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import { HookScene } from "../scenes/HookScene";
import { ProblemScene } from "../scenes/ProblemScene";
import { SolutionScene } from "../scenes/SolutionScene";
import { ContrastScene } from "../scenes/ContrastScene";
import { CTAScene } from "../scenes/CTAScene";

/**
 * Portrait (9:16) composition for YouTube Shorts, TikTok, Reels
 * 1080x1920 @ 30fps
 * Total duration: 45 seconds (1350 frames)
 *
 * FASTER PACING (same as landscape):
 * - Hook: 0-3.5s (frames 0-105)
 * - Problem: 3.5-9s (frames 105-270)
 * - Solution: 9-24s (frames 270-720)
 * - Contrast: 24-35s (frames 720-1050)
 * - CTA: 35-45s (frames 1050-1350)
 */

export const PortraitVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene timings in frames - FASTER PACING
  const HOOK_START = 0;
  const HOOK_DURATION = Math.round(3.5 * fps);

  const PROBLEM_START = HOOK_START + HOOK_DURATION;
  const PROBLEM_DURATION = Math.round(5.5 * fps);

  const SOLUTION_START = PROBLEM_START + PROBLEM_DURATION;
  const SOLUTION_DURATION = 15 * fps;

  const CONTRAST_START = SOLUTION_START + SOLUTION_DURATION;
  const CONTRAST_DURATION = 11 * fps;

  const CTA_START = CONTRAST_START + CONTRAST_DURATION;
  const CTA_DURATION = 10 * fps;

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
        <HookScene isPortrait={true} />
      </Sequence>

      {/* Scene 2: Problem - Boring grammar apps */}
      <Sequence from={PROBLEM_START} durationInFrames={PROBLEM_DURATION}>
        <ProblemScene isPortrait={true} />
      </Sequence>

      {/* Scene 3: Solution - Grammario Italian demo */}
      <Sequence from={SOLUTION_START} durationInFrames={SOLUTION_DURATION}>
        <SolutionScene isPortrait={true} />
      </Sequence>

      {/* Scene 4: Contrast - German accusative case */}
      <Sequence from={CONTRAST_START} durationInFrames={CONTRAST_DURATION}>
        <ContrastScene isPortrait={true} />
      </Sequence>

      {/* Scene 5: CTA - 5 languages, sign up */}
      <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
        <CTAScene isPortrait={true} />
      </Sequence>
    </div>
  );
};
