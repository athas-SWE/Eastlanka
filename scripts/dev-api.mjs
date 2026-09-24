import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import publish from '../api/facebook/publish.mjs';
import settings from '../api/facebook/settings.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  let text = '';
  try {
    text = readFileSync(join(root, '.env'), 'utf8');
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const port = Number(process.env.API_PORT || 3001);
const routes = new Map([
  ['/api/facebook/settings', settings],
  ['/api/facebook/publish', publish],
]);

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
  const handler = routes.get(url.pathname);
  if (!handler) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found.' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  let body = {};
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = {};
    }
  }

  const vercelRes = {
    statusCode: 200,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    json(payload) {
      if (res.writableEnded) {
        return;
      }
      res.statusCode = this.statusCode;
      res.setHeader('Content-Type', 'application/json');
      for (const [name, value] of Object.entries(this.headers)) {
        res.setHeader(name, value);
      }
      res.end(JSON.stringify(payload));
    },
  };

  try {
    await handler(
      {
        method: req.method,
        headers: req.headers,
        body,
        query: Object.fromEntries(url.searchParams),
      },
      vercelRes,
    );
  } catch (err) {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'API error.' }));
    }
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Facebook API listening on http://127.0.0.1:${port}`);
});
