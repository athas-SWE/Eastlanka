import { assertAdmin, fetchPageName, json, publicStatus, readSettings } from '../_lib/facebook.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const auth = assertAdmin(req);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  try {
    let settings = await readSettings();
    if (settings.pageId && settings.pageAccessToken && !settings.pageName) {
      try {
        settings = { ...settings, pageName: await fetchPageName(settings.pageId, settings.pageAccessToken) };
      } catch {
        // Page ID still shows when Facebook does not return a name.
      }
    }
    json(res, 200, publicStatus(settings));
  } catch (err) {
    json(res, 502, { error: err instanceof Error ? err.message : 'Could not read Facebook settings.' });
  }
}
