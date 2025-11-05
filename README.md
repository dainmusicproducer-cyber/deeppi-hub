# DeepPI Distribution Hub 🎵

**One-Stop Distribution Hub** – PWA + Bot + Public Archive for all DeepPI releases.

## 🎯 Features

- 📦 **Public Archive**: Structured catalog of all releases (tracks, EPs, sets, stems)
- 📱 **Progressive Web App**: App-like UX with offline support
- 🤖 **Telegram Bot**: Auto-posts release cards with covers and download links
- 🚀 **Automated Pipeline**: Render → Upload → Index → Distribute
- 🎨 **Dynamic Covers**: Auto-generated covers matching mood and genre
- 🔍 **Smart Search**: Filter by BPM, key, mood, genre, date
- 🎛️ **Commander Panel**: Centralized control for prompts, parameters & releases

## 🏗️ Architecture

```
Storage/CDN          → Cloudflare R2 (S3-compatible, zero egress)
Frontend (PWA)       → Next.js 14 + Tailwind + PWA plugin
Metadata             → JSON catalog + optional Supabase
Automation           → Cloudflare Workers + GitHub Actions
Bot                  → Telegram Bot API with webhooks
Hosting              → Vercel (Frontend) + Cloudflare (Workers)
```

## 📁 Repository Structure

```
deeppi-hub/
├── apps/
│   ├── web/                    # Next.js PWA
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   ├── public/            # Static assets
│   │   └── package.json
│   └── worker/                # Cloudflare Worker
│       ├── src/
│       └── wrangler.toml
├── packages/
│   ├── catalog-schema/        # JSON Schema validation
│   └── upload-cli/            # Upload automation CLI
├── scripts/
│   ├── upload.js              # Upload automation
│   ├── generate-catalog.js    # Catalog generator
│   └── telegram-bot.js        # Bot integration
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
├── catalog.json               # Global catalog
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/deeppi-hub.git
cd deeppi-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Upload a Release

```bash
npm run upload -- \
  --audio ./path/to/track.wav \
  --cover ./path/to/cover.jpg \
  --title "Nullsicht" \
  --bpm 132 \
  --key "C minor" \
  --genre "Dark Hypnotic Techno" \
  --mood "dark,melancholic,hypnotic"
```

## 🔧 Environment Variables

```env
# R2/S3 Storage
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=deeppi-releases
R2_PUBLIC_URL=https://cdn.example.com

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@deeppi_releases

# Vercel (for build hooks)
VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/...
```

## 📦 Catalog Schema

Each release follows this structure:

```json
{
  "title": "Nullsicht",
  "artist": "DeepPI",
  "slug": "nullsicht",
  "date": "2025-11-05",
  "bpm": 132,
  "key": "C minor",
  "mood": ["dark", "melancholic", "hypnotic"],
  "genre": "Dark Hypnotic Techno",
  "duration": "03:59",
  "cover_url": "https://cdn.../cover.jpg",
  "audio_mp3_url": "https://cdn.../audio.mp3",
  "audio_wav_url": "https://cdn.../audio.wav",
  "tags": ["ultra-melodic", "monotone", "organ", "piano"],
  "description": "Inverse climax, dry kick/sub, grand organ + felt-piano shadows.",
  "catalog_id": "DPI-2025-0012"
}
```

## 🤖 Telegram Bot

The bot automatically posts release cards:

```
🎵 Nullsicht (132 BPM • C minor)

🏷️ #DarkTechno #Hypnotic #Melancholic

Inverse climax, dry kick/sub, grand organ + felt-piano shadows.

▶️ Stream: https://deeppi.app/release/nullsicht
⬇️ Download: https://cdn.../nullsicht.mp3

#DeepPI #NewRelease
```

## 📚 Documentation

- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Catalog Schema](./packages/catalog-schema/README.md)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Storage**: Cloudflare R2 (S3-compatible)
- **Automation**: Cloudflare Workers, GitHub Actions
- **Bot**: Telegram Bot API
- **Deployment**: Vercel (PWA), Cloudflare (Workers)

## 📄 License

MIT

---

Built with ❤️ for the underground techno community
