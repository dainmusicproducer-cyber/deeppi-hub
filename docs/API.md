# API Documentation

## Catalog API

### GET /catalog.json

Returns the complete catalog of all releases.

**Response:**
```json
{
  "version": 1,
  "updated_at": "2025-11-05T12:00:00Z",
  "releases": [
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
      "catalog_id": "DPI-2025-0012"
    }
  ]
}
```

---

## Upload Script API

### Command Line

```bash
npm run upload -- [options]
```

**Options:**
- `--audio <path>` - Path to audio file (required)
- `--cover <path>` - Path to cover image (required)
- `--title <string>` - Track title (required)
- `--bpm <number>` - BPM (required)
- `--genre <string>` - Genre (required)
- `--key <string>` - Musical key (optional)
- `--mood <csv>` - Comma-separated moods (optional)
- `--tags <csv>` - Comma-separated tags (optional)
- `--description <string>` - Release description (optional)
- `--date <YYYY-MM-DD>` - Release date (optional, defaults to today)
- `--slug <string>` - Custom slug (optional, auto-generated from title)

**Example:**
```bash
npm run upload -- \
  --audio track.wav \
  --cover cover.jpg \
  --title "Midnight Echo" \
  --bpm 135 \
  --key "G minor" \
  --genre "Melodic Techno" \
  --mood "atmospheric,deep,progressive" \
  --tags "synth,bassline,reverb"
```

---

## Telegram Bot API

### Post Release

```bash
npm run telegram-post
```

Posts the latest release from `catalog.json` to the configured Telegram channel.

**Message Format:**
```
🎵 {title} ({bpm} BPM • {key})

🏷️ #{mood1} #{mood2} #{genre}

{description}

▶️ Stream: {release_url}
⬇️ Download: {audio_url}

#{tags} #DeepPI #NewRelease
```

---

## Catalog Naming Convention

### Catalog ID Format

`DPI-{YEAR}-{NUMBER}`

Examples:
- `DPI-2025-0001` (First release of 2025)
- `DPI-2025-0142` (142nd release of 2025)

### Slug Format

Lowercase, hyphenated, ASCII-only:
- `nullsicht`
- `midnight-echo`
- `parallel-dimensions`

### File Structure

```
/releases/{year}/{bpm}bpm_{key}_{genre}/
  {slug}/
    audio/
      {slug}.mp3
      {slug}.wav
    cover/
      {slug}_cover.jpg
      {slug}_cover_square.jpg
    meta/
      {slug}.json
```

Example:
```
/releases/2025/132bpm_Cminor_darktechno/
  nullsicht/
    audio/
      nullsicht.mp3
      nullsicht.wav
    cover/
      nullsicht_cover.jpg
    meta/
      nullsicht.json
```

---

## Schema Reference

### Release Object

```typescript
interface Release {
  title: string;
  artist: string;           // Default: "DeepPI"
  slug: string;             // lowercase-hyphenated
  date: string;             // YYYY-MM-DD
  bpm: number;              // 60-200
  key: string;              // e.g., "C minor"
  mood: string[];           // ["dark", "hypnotic"]
  genre: string;            // "Dark Hypnotic Techno"
  duration: string;         // "03:59"
  cover_url: string;        // Full URL to cover image
  audio_mp3_url: string;    // Full URL to MP3
  audio_wav_url?: string;   // Optional WAV
  tags: string[];           // ["organ", "piano"]
  description: string;      // Short description
  catalog_id: string;       // DPI-YYYY-####
  checksum_md5?: string;    // MD5 hash of audio file
}
```

### Catalog Object

```typescript
interface Catalog {
  version: number;          // Schema version
  updated_at: string;       // ISO 8601 timestamp
  releases: Release[];      // Array of releases
  sets?: Set[];             // Optional DJ sets
  playlists?: Playlist[];   // Optional playlists
}
```

---

## Error Codes

### Upload Script

- `EXIT 1` - Missing required parameter
- `EXIT 1` - File not found
- `EXIT 1` - Upload failed (check R2 credentials)

### Telegram Bot

- `400` - Invalid chat_id or message format
- `403` - Bot not authorized in channel
- `404` - Channel not found
- `429` - Rate limit exceeded

---

## Rate Limits

- **R2 API**: No explicit limit (fair use)
- **Telegram Bot**: 30 messages/second per chat
- **Vercel Build**: 100 builds/day (Hobby plan)

---

## Webhook Integration (Advanced)

### R2 Event Notifications

Configure webhook URL to trigger on new uploads:

```bash
curl -X POST https://api.cloudflare.com/client/v4/accounts/{account_id}/event_notifications/r2/configuration/{bucket_name} \
  -H "Authorization: Bearer {api_token}" \
  -d '{
    "notification_urls": ["https://your-worker.workers.dev/webhook"],
    "bucket": "deeppi-releases"
  }'
```

### Worker Endpoint

```javascript
// apps/worker/src/index.js
export default {
  async fetch(request) {
    const event = await request.json();

    if (event.object_key.endsWith('.mp3')) {
      // Trigger catalog update
      await fetch(process.env.VERCEL_DEPLOY_HOOK, { method: 'POST' });

      // Post to Telegram
      // ... telegram bot logic
    }

    return new Response('OK', { status: 200 });
  }
}
```

---

## Future API Endpoints

### Planned Features

- `GET /api/releases/{slug}` - Get single release
- `GET /api/search?q={query}` - Search releases
- `GET /api/filter?bpm=132&genre=techno` - Filter releases
- `GET /api/random` - Get random release
- `POST /api/webhook/upload` - Trigger upload pipeline
