import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;
const folder = env.CLOUDINARY_FOLDER || 'offer-lanka';
const filePath = join(root, 'src/assets/brand/east-lanka-logo.jpg');
const timestamp = Math.floor(Date.now() / 1000);
const params = { folder, overwrite: true, public_id: 'brand-logo', timestamp };
const signature = createHash('sha1')
  .update(
    Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&') + apiSecret,
  )
  .digest('hex');

const body = new FormData();
body.append('file', new Blob([readFileSync(filePath)]), basename(filePath));
body.append('api_key', apiKey);
body.append('timestamp', String(timestamp));
body.append('folder', folder);
body.append('public_id', 'brand-logo');
body.append('overwrite', 'true');
body.append('signature', signature);

const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
  method: 'POST',
  body,
});

if (!response.ok) {
  throw new Error(await response.text());
}

const data = await response.json();
console.log(`Uploaded ${data.public_id} ${data.secure_url}`);
