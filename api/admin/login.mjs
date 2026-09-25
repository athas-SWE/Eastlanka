import { assertAdmin, json, readBody } from '../_lib/facebook.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    json(res, 405, { error: 'Method not allowed.' });
    return;
  }

  readBody(req);
  const auth = assertAdmin(req);
  if (!auth.ok) {
    json(res, auth.status, { error: auth.error });
    return;
  }

  json(res, 200, { ok: true });
}
