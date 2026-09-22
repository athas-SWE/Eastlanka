import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

function loadEnv() {
  const values = {};
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }
    values[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return values;
}

const env = loadEnv();
const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;
const folder = env.CLOUDINARY_FOLDER || 'offer-lanka';
const presetName = env.CLOUDINARY_DATA_PRESET || 'offer_lanka_data';

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary credentials in .env');
}

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
const payload = {
  unsigned: true,
  folder,
  overwrite: false,
  unique_filename: true,
  use_filename: false,
  tags: 'eastlanka-catalogue',
};

const existing = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${presetName}`, {
  headers: { Authorization: `Basic ${auth}` },
});

if (existing.ok) {
  const update = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${presetName}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!update.ok) {
    throw new Error(`Could not update data preset: ${await update.text()}`);
  }
  console.log(`Updated unsigned data preset: ${presetName}`);
} else {
  const create = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: presetName, ...payload }),
  });
  if (!create.ok) {
    throw new Error(`Could not create data preset: ${await create.text()}`);
  }
  console.log(`Created unsigned data preset: ${presetName}`);
}

const list = await fetch(`https://res.cloudinary.com/${cloudName}/raw/list/eastlanka-catalogue.json`);
console.log(`Resource list status: ${list.status}`);
if (!list.ok) {
  console.log('Enable Resource list in Cloudinary Settings > Security if public catalogue sync is needed.');
}
