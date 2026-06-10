# 17 — Asset Guide

## 1. Asset folders

```txt
public/
  images/
    avatar/
    backgrounds/
    projects/
    og/
  audio/
  models/
  games/
  cv/
```

## 2. Image direction

### Avatar dark fantasy prompt

```txt
Professional portrait of a young Unity game developer,
dark fantasy style, black cloak, subtle glowing runes,
cursed forest biome background, cinematic rim lighting,
blue violet magic aura, recruiter-friendly, not horror gore,
high detail, realistic, 4k
```

### Biomes background prompts

Abyss Forest:

```txt
Dark fantasy cursed forest biome, ancient trees, fog, glowing blue runes,
subtle fireflies, cinematic depth, game menu background
```

Blood Moon Ruins:

```txt
Dark fantasy ruined castle under blood moon, red mist, broken arches,
obsidian stones, glowing ritual circle, game UI background
```

Arcane Library:

```txt
Ancient dark fantasy library, floating books, purple magic dust,
rune candles, cinematic soft light, mysterious but readable
```

## 3. File formats

| Asset | Format | Note |
|---|---|---|
| Background | `.webp` / `.avif` | Optimize size |
| Avatar | `.webp` | 1024–1600px enough |
| Icon | `.svg` | Scalable |
| Audio | `.ogg` + `.mp3` fallback | Loopable |
| 3D model | `.glb` | Low-poly/optimized |
| WebGL | Unity Build output | Lazy load |
| CV | `.pdf` | Public download |

## 4. Audio licensing

Chỉ dùng:

- Nhạc tự làm.
- Nhạc royalty-free có license rõ.
- Nhạc Creative Commons đúng điều kiện.
- Không dùng Spotify audio để embed trái phép làm background website.

Nếu muốn “âm thanh của Spotify”, nên dùng link/playlist embed hợp lệ, không rip file.

## 5. Optimization

```bash
# image optimization examples
npx sharp-cli -i input.png -o output.webp --quality 80
```

Rules:

- Background < 500KB nếu có thể.
- Avatar < 300KB.
- Audio loop < 2–4MB/track nếu web public.
- 3D model < 1–2MB cho hero.
- WebGL demo tách lazy route.

## 6. Project screenshots

Mỗi featured repo nên có:

```txt
cover.webp
screenshot-01.webp
screenshot-02.webp
demo.mp4 optional
architecture.png optional
```

## 7. OG image

```txt
1200x630
Dark fantasy background
Avatar/relic right
Text left:
Phạm Minh Sáng
Unity Developer Portfolio
Live GitHub Repos • WebGL Demo • C# Gameplay
```

