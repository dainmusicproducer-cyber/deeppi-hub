# Deployment Guide

## Prerequisites

- Node.js 20+ installed
- GitHub account
- Cloudflare account (for R2 storage)
- Telegram Bot Token (from @BotFather)
- Vercel account (for hosting)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/dainmusicproducer-cyber/deeppi-hub.git
cd deeppi-hub
```

---

## Step 2: Set Up Cloudflare R2 Storage

### 2.1 Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage**
3. Click **Create Bucket**
4. Name: `deeppi-releases`
5. Enable **Public Access** for the bucket

### 2.2 Generate API Credentials

1. Go to **R2 → Manage R2 API Tokens**
2. Create new API token with:
   - **Admin Read & Write** permissions
   - Scope: `deeppi-releases` bucket
3. Save the credentials:
   - `Access Key ID`
   - `Secret Access Key`
   - `Account ID`

### 2.3 Set Up Public Domain (Optional)

Connect a custom domain to your R2 bucket for clean URLs:
- Go to bucket settings → **Custom Domains**
- Add domain: `cdn.deeppi.app`

---

## Step 3: Set Up Telegram Bot

### 3.1 Create Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose name: `DeepPI Releases`
4. Choose username: `@deeppi_releases_bot`
5. Copy the **Bot Token**

### 3.2 Create Channel

1. Create a new Telegram channel: `DeepPI Releases`
2. Make it public with username: `@deeppi_releases`
3. Add your bot as an administrator with:
   - ✅ Post messages
   - ✅ Edit messages

### 3.3 Get Channel ID

```bash
# Method 1: Forward a message from the channel to @userinfobot
# Method 2: Use this script:
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates"
```

---

## Step 4: Configure Environment Variables

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# R2 Storage
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=deeppi-releases
R2_PUBLIC_URL=https://cdn.deeppi.app

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@deeppi_releases

# Site URL
NEXT_PUBLIC_SITE_URL=https://deeppi.app
```

---

## Step 5: Install Dependencies

```bash
npm install
```

This installs:
- Next.js PWA dependencies
- AWS SDK for R2 uploads
- Axios for Telegram API
- AJV for catalog validation

---

## Step 6: Deploy Frontend (Vercel)

### 6.1 Connect to Vercel

```bash
cd apps/web
npx vercel
```

Follow prompts:
- Link to existing project? **No**
- Project name: `deeppi-hub`
- Directory: `./apps/web`

### 6.2 Configure Environment Variables

In Vercel Dashboard:
1. Go to **Settings → Environment Variables**
2. Add:
   - `NEXT_PUBLIC_SITE_URL` = `https://deeppi.vercel.app`
   - `R2_PUBLIC_URL` = Your R2 public URL

### 6.3 Deploy

```bash
npx vercel --prod
```

### 6.4 Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add: `deeppi.app`
3. Follow DNS configuration instructions

---

## Step 7: Test Upload Pipeline

### 7.1 Prepare Test Release

Create test files:
- `test-track.mp3` (audio file)
- `test-cover.jpg` (1200x1200px cover image)

### 7.2 Run Upload Script

```bash
npm run upload -- \
  --audio ./test-track.mp3 \
  --cover ./test-cover.jpg \
  --title "Test Track" \
  --bpm 128 \
  --key "A minor" \
  --genre "Techno" \
  --mood "dark,hypnotic" \
  --tags "test,melodic,bassline" \
  --description "This is a test release"
```

Expected output:
```
🚀 DeepPI Upload Automation

📦 Uploading: Test Track
🏷️  Slug: test-track
🆔 Catalog ID: DPI-2025-0001

🎵 Uploading audio...
   ✅ https://cdn.deeppi.app/releases/2025/...
🖼️  Uploading cover...
   ✅ https://cdn.deeppi.app/releases/2025/...
📝 Uploading metadata...
   ✅ https://cdn.deeppi.app/releases/2025/...
📚 Updating catalog...
   ✅ Catalog updated

✨ Upload complete!
🔗 Release URL: https://deeppi.app/release/test-track
```

### 7.3 Post to Telegram

```bash
npm run telegram-post
```

Check your Telegram channel for the post!

---

## Step 8: Automation (Optional)

### 8.1 GitHub Actions

Already configured in `.github/workflows/deploy.yml`

Triggers on:
- Push to `main` branch
- Manual workflow dispatch

### 8.2 Vercel Deploy Hook

1. Get Vercel Deploy Hook URL:
   - Vercel Dashboard → **Settings → Git → Deploy Hooks**
   - Create: `catalog-update`
2. Add to GitHub Secrets:
   - Repository → **Settings → Secrets**
   - New secret: `VERCEL_DEPLOY_HOOK`

### 8.3 Cloudflare Worker (Advanced)

For webhook automation on R2 uploads:

```bash
cd apps/worker
npm install
npx wrangler deploy
```

---

## Step 9: Validate Setup

### 9.1 Check Catalog

```bash
npm run validate-catalog
```

Should output: `✅ Catalog is valid`

### 9.2 Check Repository

Visit: https://github.com/dainmusicproducer-cyber/deeppi-hub

### 9.3 Check Live Site

Visit: https://deeppi.vercel.app (or your custom domain)

### 9.4 Check Telegram Channel

Visit: https://t.me/deeppi_releases

---

## Troubleshooting

### Upload fails with "Access Denied"
- ✅ Verify R2 API credentials
- ✅ Check bucket permissions (must allow public read)
- ✅ Confirm Access Key has write permissions

### Telegram bot doesn't post
- ✅ Verify bot token is correct
- ✅ Check bot is admin in channel
- ✅ Confirm channel ID format: `@username` or `-100123456789`

### Catalog validation fails
- ✅ Check JSON syntax in `catalog.json`
- ✅ Verify all required fields are present
- ✅ Run `npm run validate-catalog` for details

### Build fails on Vercel
- ✅ Check `apps/web/package.json` dependencies
- ✅ Verify Node.js version (must be 20+)
- ✅ Review Vercel build logs

---

## Next Steps

1. **Customize Design**: Edit `apps/web/app` components
2. **Add Features**: Implement search, filters, playlists
3. **Cover Generation**: Integrate AI image generation (Replicate, Stability AI)
4. **Analytics**: Add Plausible or Umami tracking
5. **Commander Panel**: Build admin dashboard for batch operations

---

## Support

- 📖 [API Documentation](./API.md)
- 🐛 [GitHub Issues](https://github.com/dainmusicproducer-cyber/deeppi-hub/issues)
- 💬 [Telegram Channel](https://t.me/deeppi_releases)
