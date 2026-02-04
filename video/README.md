# Grammario Demo Video

Remotion-based demo video for Grammario, featuring two compositions:
- **LandscapeVideo** (16:9, 1920x1080) - YouTube
- **PortraitVideo** (9:16, 1080x1920) - YouTube Shorts, TikTok, Instagram Reels

## Quick Start

```bash
# Install dependencies
npm install

# Start Remotion Studio (preview)
npm start
```

Open [http://localhost:3000](http://localhost:3000) to preview the video in Remotion Studio.

## Video Structure

The video is 45 seconds long with 5 scenes:

| Scene | Duration | Content |
|-------|----------|---------|
| Hook | 0-5s | "Stop guessing grammar." |
| Problem | 5-12s | Generic grammar app showing only "NOUN" |
| Solution | 12-30s | Grammario demo with Italian sentence |
| Contrast | 30-40s | German accusative case explanation |
| CTA | 40-45s | 5 languages, sign up CTA |

## Rendering

```bash
# Render 16:9 for YouTube
npm run build

# Render 9:16 for Shorts/TikTok
npm run build:portrait

# Render both
npm run build:all
```

Output files will be in the `out/` directory:
- `grammario-youtube.mp4`
- `grammario-shorts.mp4`

## Customization

### Changing Text/Copy
Edit the text in each scene file in `src/scenes/`:
- `HookScene.tsx` - Opening hook text
- `ProblemScene.tsx` - Problem statement
- `CTAScene.tsx` - Call to action and URL

### Changing Languages Showcased
Edit `src/data/sentences.ts` to modify:
- Italian and German sentence data
- Pedagogical explanations
- Supported languages list

### Adjusting Timing
Modify frame timings in:
- `src/compositions/LandscapeVideo.tsx`
- `src/compositions/PortraitVideo.tsx`

## Project Structure

```
video/
├── src/
│   ├── Root.tsx                 # Composition registration
│   ├── compositions/
│   │   ├── LandscapeVideo.tsx   # 16:9 YouTube
│   │   └── PortraitVideo.tsx    # 9:16 Shorts
│   ├── scenes/
│   │   ├── HookScene.tsx
│   │   ├── ProblemScene.tsx
│   │   ├── SolutionScene.tsx
│   │   ├── ContrastScene.tsx
│   │   └── CTAScene.tsx
│   ├── components/
│   │   ├── AnimatedText.tsx
│   │   ├── WordNode.tsx
│   │   ├── SentenceFlow.tsx
│   │   ├── TeacherNotes.tsx
│   │   └── AppMockup.tsx
│   ├── data/
│   │   └── sentences.ts
│   └── styles/
│       └── global.css
├── public/
│   └── logo.png
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

## Adding Music

To add background music:

1. Add your audio file to `public/` (e.g., `music.mp3`)
2. Import and use Remotion's `Audio` component:

```tsx
import { Audio } from "remotion";

// In your composition
<Audio src={staticFile("music.mp3")} volume={0.5} />
```

## Tech Stack

- [Remotion](https://remotion.dev) - React-based video creation
- TypeScript
- React 18
