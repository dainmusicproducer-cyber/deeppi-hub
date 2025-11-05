#!/usr/bin/env node

/**
 * DeepPI Telegram Bot
 * 
 * Posts release announcements to Telegram channel
 */

const axios = require('axios');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deeppi.app';

async function sendTelegramMessage(text, imageUrl = null) {
  const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

  try {
    if (imageUrl) {
      // Send photo with caption
      await axios.post(`${baseUrl}/sendPhoto`, {
        chat_id: TELEGRAM_CHANNEL_ID,
        photo: imageUrl,
        caption: text,
        parse_mode: 'HTML',
      });
    } else {
      // Send text message
      await axios.post(`${baseUrl}/sendMessage`, {
        chat_id: TELEGRAM_CHANNEL_ID,
        text: text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      });
    }

    console.log('✅ Message sent to Telegram');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Telegram message:', error.response?.data || error.message);
    return false;
  }
}

function formatReleaseMessage(release) {
  const moodTags = release.mood.map(m => `#${m.replace(/\s+/g, '')}`).join(' ');
  const tags = release.tags.slice(0, 5).map(t => `#${t.replace(/\s+/g, '')}`).join(' ');

  const message = `
🎵 <b>${release.title}</b> (${release.bpm} BPM • ${release.key})

🏷️ ${moodTags} #${release.genre.replace(/\s+/g, '')}

${release.description}

▶️ <a href="${SITE_URL}/release/${release.slug}">Stream</a> | ⬇️ <a href="${release.audio_mp3_url}">Download MP3</a>${release.audio_wav_url ? ` | <a href="${release.audio_wav_url}">WAV</a>` : ''}

${tags} #DeepPI #NewRelease
`.trim();

  return message;
}

async function postRelease(release) {
  console.log('📢 Posting to Telegram...');
  console.log(`   Title: ${release.title}`);
  console.log(`   Channel: ${TELEGRAM_CHANNEL_ID}\n`);

  const message = formatReleaseMessage(release);
  const success = await sendTelegramMessage(message, release.cover_url);

  return success;
}

// CLI usage
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');

  // Get latest release from catalog
  const catalogPath = path.join(__dirname, '..', 'catalog.json');

  if (!fs.existsSync(catalogPath)) {
    console.error('❌ catalog.json not found');
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

  if (catalog.releases.length === 0) {
    console.error('❌ No releases in catalog');
    process.exit(1);
  }

  const latestRelease = catalog.releases[0];
  postRelease(latestRelease).catch(console.error);
}

module.exports = { postRelease, sendTelegramMessage };
