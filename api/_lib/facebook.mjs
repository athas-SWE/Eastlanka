import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const GRAPH_VERSION = 'v21.0';
const SETTINGS_FORMAT = 'txt';

export function json(res, status, body) {
  res.status(status).json(body);
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  return {};
}

export function assertAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (!expected) {
    return { ok: false, status: 500, error: 'ADMIN_PASSWORD is not configured.' };
  }
  const header = req.headers?.['x-admin-password'];
  const fromHeader = Array.isArray(header) ? header[0] ?? '' : typeof header === 'string' ? header : '';
  const fromBody = typeof req.body?.password === 'string' ? req.body.password : '';
  const password = fromHeader || fromBody;
  if (!passwordMatch(password, expected)) {
    return { ok: false, status: 401, error: 'Admin password was not accepted.' };
  }
  return { ok: true };
}

export async function readSettings() {
  let stored = emptySettings();
  try {
    const ciphertext = await downloadSettings();
    if (ciphertext) {
      stored = normalizeSettings(JSON.parse(decrypt(ciphertext)));
    }
  } catch (err) {
    if (!envConnection()) {
      throw err instanceof Error ? err : new Error('Saved Facebook settings could not be read.');
    }
  }
  return applyEnvConnection(stored);
}

export async function writeSettings(settings) {
  await uploadSettings(encrypt(JSON.stringify(normalizeSettings(settings))));
}

export function publicStatus(settings) {
  return {
    connected: Boolean(settings.pageId && settings.pageAccessToken),
    pageId: settings.pageId,
    pageName: settings.pageName,
    autoPost: settings.autoPost,
    lastPostAt: settings.lastPostAt,
    lastPostUrl: settings.lastPostUrl,
  };
}

export async function fetchPageName(pageId, pageAccessToken) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}`);
  url.searchParams.set('fields', 'id,name');
  url.searchParams.set('access_token', pageAccessToken);
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(facebookError(data) || 'Facebook rejected the page connection.');
  }
  return typeof data.name === 'string' && data.name ? data.name : pageId;
}

export async function publishPhoto({ pageId, pageAccessToken, imageUrl, caption }) {
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pageId)}/photos`, {
    method: 'POST',
    body: new URLSearchParams({
      url: imageUrl,
      caption,
      published: 'true',
      access_token: pageAccessToken,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(facebookError(data) || 'Facebook did not publish the photo.');
  }
  const postId = typeof data.post_id === 'string' && data.post_id ? data.post_id : String(data.id ?? '');
  if (!postId) {
    throw new Error('Facebook did not return a post id.');
  }
  return {
    postId,
    postUrl: `https://www.facebook.com/${postId}`,
  };
}

export function buildCaption({ name, price, originalPrice, description, code, whatsappNumber }) {
  const lines = [name.trim(), '', formatLkr(price)];
  if (Number.isFinite(originalPrice) && originalPrice > price) {
    lines.push(`Was ${formatLkr(originalPrice)}`);
  }
  lines.push('', description.trim(), '', `Shop: ${siteOrigin()}/products/${encodeURIComponent(code)}`);
  const whatsapp = String(whatsappNumber ?? '').replace(/\D/g, '');
  if (whatsapp) {
    lines.push(`WhatsApp: https://wa.me/${whatsapp}`);
  }
  return lines.join('\n');
}

export function imageUrl(image) {
  const value = String(image ?? '').trim();
  if (!value) {
    return '';
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || 'derggujli';
  return `https://res.cloudinary.com/${cloud}/image/upload/f_jpg,q_auto/${value}`;
}

export function emptySettings() {
  return {
    pageId: '',
    pageAccessToken: '',
    autoPost: true,
    pageName: '',
    lastPostAt: null,
    lastPostUrl: null,
  };
}

function envValue(name) {
  let value = (process.env[name] ?? '').trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

function envConnection() {
  const pageId = envValue('FB_PAGE_ID');
  const pageAccessToken = envValue('FB_PAGE_ACCESS_TOKEN');
  if (!pageId || !pageAccessToken) {
    return null;
  }
  return {
    pageId,
    pageAccessToken,
    autoPost: envValue('FB_AUTO_POST').toLowerCase() !== 'false',
  };
}

function applyEnvConnection(settings) {
  const fromEnv = envConnection();
  if (!fromEnv) {
    return settings;
  }
  return {
    ...settings,
    pageId: fromEnv.pageId,
    pageAccessToken: fromEnv.pageAccessToken,
    autoPost: fromEnv.autoPost,
  };
}

function normalizeSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    pageId: typeof source.pageId === 'string' ? source.pageId.trim() : '',
    pageAccessToken: typeof source.pageAccessToken === 'string' ? source.pageAccessToken.trim() : '',
    autoPost: source.autoPost !== false,
    pageName: typeof source.pageName === 'string' ? source.pageName : '',
    lastPostAt: typeof source.lastPostAt === 'string' ? source.lastPostAt : null,
    lastPostUrl: typeof source.lastPostUrl === 'string' ? source.lastPostUrl : null,
  };
}

function formatLkr(amount) {
  return `Rs. ${Number(amount).toLocaleString('en-LK')}`;
}

function siteOrigin() {
  return (process.env.SITE_URL || 'https://eastlanka.lk').replace(/\/$/, '');
}

function facebookError(data) {
  const message = data?.error?.error_user_msg || data?.error?.message;
  return typeof message === 'string' ? message : '';
}

function passwordMatch(given, expected) {
  const left = Buffer.from(given);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function settingsKey() {
  const secret = process.env.FB_SETTINGS_KEY ?? '';
  if (secret.length < 16) {
    throw new Error('FB_SETTINGS_KEY is not configured.');
  }
  return scryptSync(secret, 'eastlanka-fb-settings', 32);
}

function encrypt(plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', settingsKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(payload) {
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', settingsKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'derggujli';
  const apiKey = process.env.CLOUDINARY_API_KEY ?? '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? '';
  const folder = process.env.CLOUDINARY_FOLDER || 'offer-lanka';
  if (!apiKey || !apiSecret) {
    throw new Error('Cloudinary API credentials are not configured.');
  }
  return {
    cloudName,
    apiKey,
    apiSecret,
    publicId: `${folder}/private/facebook-settings`,
  };
}

function sign(params, apiSecret) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('&');
  return createHash('sha1').update(serialized + apiSecret).digest('hex');
}

async function uploadSettings(ciphertext) {
  const { cloudName, apiKey, apiSecret, publicId } = cloudinaryConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = {
    overwrite: 'true',
    public_id: publicId,
    timestamp,
    type: 'authenticated',
  };
  const body = new FormData();
  body.set('file', new Blob([ciphertext], { type: 'text/plain' }), `facebook-settings.${SETTINGS_FORMAT}`);
  body.set('public_id', publicId);
  body.set('timestamp', timestamp);
  body.set('type', 'authenticated');
  body.set('overwrite', 'true');
  body.set('api_key', apiKey);
  body.set('signature', sign(params, apiSecret));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error('Could not store Facebook settings.');
  }
}

async function downloadSettings() {
  const { cloudName, apiKey, apiSecret, publicId } = cloudinaryConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const expiresAt = String(Number(timestamp) + 120);
  const params = {
    expires_at: expiresAt,
    format: SETTINGS_FORMAT,
    public_id: publicId,
    timestamp,
    type: 'authenticated',
  };
  const query = new URLSearchParams({
    ...params,
    api_key: apiKey,
    signature: sign(params, apiSecret),
  });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/download?${query}`);
  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 404 || /not found|does not exist/i.test(detail)) {
      return null;
    }
    throw new Error('Could not read Facebook settings.');
  }
  const text = (await response.text()).trim();
  return text || null;
}
