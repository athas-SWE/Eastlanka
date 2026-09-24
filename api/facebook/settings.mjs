import { assertAdmin, fetchPageName, json, publicStatus, readBody, readSettings, writeSettings } from '../_lib/facebook.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const body = readBody(req);
  const auth = assertAdmin(req);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    if (req.method === 'GET') {
      const settings = await readSettings();
      json(res, 200, publicStatus(settings));
      return;
    }

    const current = await readSettings();
    const pageId = typeof body.pageId === 'string' && body.pageId.trim() ? body.pageId.trim() : current.pageId;
    const pageAccessToken =
      typeof body.pageAccessToken === 'string' && body.pageAccessToken.trim()
        ? body.pageAccessToken.trim()
        : current.pageAccessToken;
    const autoPost = typeof body.autoPost === 'boolean' ? body.autoPost : current.autoPost;

    if (!pageId || !pageAccessToken) {
      json(res, 400, { error: 'Add a Facebook Page ID and a page access token.' });
      return;
    }

    const pageName = await fetchPageName(pageId, pageAccessToken);
    if (body.testOnly === true) {
      json(res, 200, {
        ...publicStatus({ ...current, pageId, pageAccessToken, pageName, autoPost }),
        tested: true,
      });
      return;
    }

    const next = {
      ...current,
      pageId,
      pageAccessToken,
      autoPost,
      pageName,
    };
    await writeSettings(next);
    json(res, 200, publicStatus(next));
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : 'Could not update Facebook settings.' });
  }
}
