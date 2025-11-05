#!/usr/bin/env node

/**
 * DeepPI Upload Automation
 * 
 * Usage:
 *   npm run upload -- --audio track.wav --cover cover.jpg --title "Track Name" --bpm 132
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Configuration
const R2_CONFIG = {
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(R2_CONFIG);

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }

  return params;
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Calculate MD5 checksum
function calculateMD5(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Generate catalog ID
function generateCatalogId() {
  const year = new Date().getFullYear();
  const catalogPath = path.join(__dirname, '..', 'catalog.json');

  let catalog = { releases: [] };
  if (fs.existsSync(catalogPath)) {
    catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  }

  const yearReleases = catalog.releases.filter(r => r.catalog_id.startsWith(`DPI-${year}`));
  const nextNumber = (yearReleases.length + 1).toString().padStart(4, '0');

  return `DPI-${year}-${nextNumber}`;
}

// Upload file to R2
async function uploadFile(filePath, destinationKey) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = path.extname(filePath) === '.mp3' ? 'audio/mpeg' : 
                      path.extname(filePath) === '.wav' ? 'audio/wav' :
                      path.extname(filePath) === '.jpg' ? 'image/jpeg' :
                      'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: destinationKey,
    Body: fileContent,
    ContentType: contentType,
  });

  await s3Client.send(command);

  const publicUrl = `${process.env.R2_PUBLIC_URL}/${destinationKey}`;
  return publicUrl;
}

// Main upload function
async function uploadRelease() {
  console.log('🚀 DeepPI Upload Automation\n');

  const params = parseArgs();

  // Validate required parameters
  const required = ['audio', 'cover', 'title', 'bpm', 'genre'];
  for (const field of required) {
    if (!params[field]) {
      console.error(`❌ Error: Missing required parameter --${field}`);
      process.exit(1);
    }
  }

  // Generate metadata
  const slug = params.slug || generateSlug(params.title);
  const date = params.date || new Date().toISOString().split('T')[0];
  const year = date.split('-')[0];
  const catalogId = generateCatalogId();

  // Build storage path
  const bpmKeyGenre = `${params.bpm}bpm_${(params.key || 'unknown').replace(/\s+/g, '')}_${params.genre.replace(/\s+/g, '').toLowerCase()}`;
  const basePath = `releases/${year}/${bpmKeyGenre}/${slug}`;

  console.log(`📦 Uploading: ${params.title}`);
  console.log(`🏷️  Slug: ${slug}`);
  console.log(`🆔 Catalog ID: ${catalogId}\n`);

  try {
    // Upload audio
    console.log('🎵 Uploading audio...');
    const audioExt = path.extname(params.audio);
    const audioKey = `${basePath}/audio/${slug}${audioExt}`;
    const audioUrl = await uploadFile(params.audio, audioKey);
    console.log(`   ✅ ${audioUrl}`);

    // Upload cover
    console.log('🖼️  Uploading cover...');
    const coverKey = `${basePath}/cover/${slug}_cover.jpg`;
    const coverUrl = await uploadFile(params.cover, coverKey);
    console.log(`   ✅ ${coverUrl}`);

    // Calculate checksum
    const checksum = calculateMD5(params.audio);

    // Build metadata object
    const metadata = {
      title: params.title,
      artist: params.artist || 'DeepPI',
      slug,
      date,
      bpm: parseInt(params.bpm),
      key: params.key || 'Unknown',
      mood: params.mood ? params.mood.split(',').map(m => m.trim()) : [],
      genre: params.genre,
      duration: params.duration || '00:00',
      cover_url: coverUrl,
      audio_mp3_url: audioExt === '.mp3' ? audioUrl : '',
      audio_wav_url: audioExt === '.wav' ? audioUrl : '',
      tags: params.tags ? params.tags.split(',').map(t => t.trim()) : [],
      description: params.description || '',
      catalog_id: catalogId,
      checksum_md5: checksum,
    };

    // Save metadata JSON
    console.log('📝 Uploading metadata...');
    const metaKey = `${basePath}/meta/${slug}.json`;
    const metaTempPath = `/tmp/${slug}.json`;
    fs.writeFileSync(metaTempPath, JSON.stringify(metadata, null, 2));
    const metaUrl = await uploadFile(metaTempPath, metaKey);
    fs.unlinkSync(metaTempPath);
    console.log(`   ✅ ${metaUrl}`);

    // Update catalog.json
    console.log('📚 Updating catalog...');
    const catalogPath = path.join(__dirname, '..', 'catalog.json');
    let catalog = { version: 1, updated_at: new Date().toISOString(), releases: [], sets: [], playlists: [] };

    if (fs.existsSync(catalogPath)) {
      catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    }

    catalog.releases.unshift(metadata);
    catalog.updated_at = new Date().toISOString();

    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
    console.log('   ✅ Catalog updated');

    console.log('\n✨ Upload complete!');
    console.log(`\n🔗 Release URL: ${process.env.NEXT_PUBLIC_SITE_URL}/release/${slug}`);

    // Output metadata for next steps (Telegram bot)
    return metadata;

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  uploadRelease().catch(console.error);
}

module.exports = { uploadRelease };
