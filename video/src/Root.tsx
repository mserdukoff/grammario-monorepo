import { Composition } from "remotion";
import { LandscapeVideo } from "./compositions/LandscapeVideo";
import { PortraitVideo } from "./compositions/PortraitVideo";
import "./styles/global.css";

// Video specs
const FPS = 30;
const DURATION_SECONDS = 45;
const DURATION_FRAMES = FPS * DURATION_SECONDS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LandscapeVideo"
        component={LandscapeVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="PortraitVideo"
        component={PortraitVideo}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
