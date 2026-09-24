import {
  assertAdmin,
  buildCaption,
  imageUrl,
  json,
  publishPhoto,
  readBody,
  readSettings,
  writeSettings,
} from '../_lib/facebook.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const body = readBody(req);
  const auth = assertAdmin(req);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  const product = body.product && typeof body.product === 'object' ? body.product : {};
  const code = typeof product.code === 'string' ? product.code.trim() : '';
  const name = typeof product.name === 'string' ? product.name.trim() : '';
  const description = typeof product.description === 'string' ? product.description.trim() : '';
  const price = Number(product.price);
  const originalPrice = product.originalPrice === undefined || product.originalPrice === null ? undefined : Number(product.originalPrice);
  const existingPostId = typeof product.facebookPostId === 'string' ? product.facebookPostId.trim() : '';

  if (existingPostId) {
    json(res, 200, { posted: false, skipped: true, reason: 'already-posted', postId: existingPostId });
    return;
  }

  if (!code || !name || !description || !Number.isFinite(price) || price <= 0) {
    json(res, 400, { posted: false, error: 'Product details are incomplete.' });
    return;
  }

  const photo = imageUrl(product.image);
  if (!photo) {
    json(res, 400, { posted: false, error: 'Product photo is missing.' });
    return;
  }

  try {
    const settings = await readSettings();
    if (!settings.pageId || !settings.pageAccessToken) {
      json(res, 200, { posted: false, skipped: true, reason: 'not-configured' });
      return;
    }
    if (!settings.autoPost) {
      json(res, 200, { posted: false, skipped: true, reason: 'disabled' });
      return;
    }

    const published = await publishPhoto({
      pageId: settings.pageId,
      pageAccessToken: settings.pageAccessToken,
      imageUrl: photo,
      caption: buildCaption({
        name,
        price,
        originalPrice,
        description,
        code,
        whatsappNumber: body.whatsappNumber,
      }),
    });

    try {
      await writeSettings({
        ...settings,
        lastPostAt: new Date().toISOString(),
        lastPostUrl: published.postUrl,
      });
    } catch {
      // The photo is already on the page. Still return the post id.
    }
    json(res, 200, { posted: true, postId: published.postId, postUrl: published.postUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Facebook post failed.';
    if (/not configured|could not be read|Could not read Facebook settings/i.test(message)) {
      json(res, 200, { posted: false, skipped: true, reason: 'not-configured' });
      return;
    }
    json(res, 502, { posted: false, error: message });
  }
}
