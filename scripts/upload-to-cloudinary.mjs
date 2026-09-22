import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
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
const presetName = env.CLOUDINARY_UPLOAD_PRESET || 'offer_lanka_unsigned';

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Missing Cloudinary credentials in .env');
}

const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

function sign(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

async function ensureUnsignedPreset() {
  const listResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${presetName}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (listResponse.ok) {
    console.log(`Upload preset already exists: ${presetName}`);
    return;
  }

  const createResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: presetName,
      unsigned: true,
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Could not create upload preset: ${await createResponse.text()}`);
  }

  console.log(`Created unsigned upload preset: ${presetName}`);
}

async function uploadFile(filePath, publicId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    overwrite: true,
    public_id: publicId,
    timestamp,
  };
  const signature = sign(params);

  const body = new FormData();
  const bytes = readFileSync(filePath);
  body.append('file', new Blob([bytes]), basename(filePath));
  body.append('api_key', apiKey);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('public_id', publicId);
  body.append('overwrite', 'true');
  body.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed for ${publicId}: ${await response.text()}`);
  }

  const data = await response.json();
  console.log(`Uploaded ${data.public_id}`);
  return data.public_id;
}

function filesIn(dir) {
  return readdirSync(dir)
    .filter((name) => /\.(svg|png|jpe?g|webp|gif)$/i.test(name))
    .map((name) => join(dir, name));
}

await ensureUnsignedPreset();

const uploads = [
  [join(root, 'src/assets/brand/east-lanka-logo.jpg'), 'brand-logo'],
  ...filesIn(join(root, 'src/assets/products')).map((file) => [file, `products/${basename(file, extname(file))}`]),
  ...filesIn(join(root, 'src/assets/categories')).map((file) => [file, `categories/${basename(file, extname(file))}`]),
];

for (const [filePath, publicId] of uploads) {
  await uploadFile(filePath, publicId);
}

console.log('Cloudinary upload complete.');
