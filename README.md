# East Lanka

Frontend-only product catalogue with WhatsApp ordering. No backend, cart, or payments.

**East Lanka — New Products • Better Tomorrow**

## Local development

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Update products

Edit [`src/app/core/data/products.ts`](src/app/core/data/products.ts).

Each product needs:

- `id`, `code` (for example `EL-001`)
- `name`, `category`, `price`
- `image` path under `src/assets/products/`
- `description`
- `available`
- optional `originalPrice` (shows on Offers)
- optional `newArrival` (shows on New Arrivals and the home page)

Then rebuild or redeploy. There is no admin panel in Phase 1.

## Update WhatsApp, Facebook, and Instagram

Edit [`src/app/core/data/site-config.ts`](src/app/core/data/site-config.ts):

- `whatsappNumber` — country code + number, no `+` or spaces (example: `94771234567`)
- `facebookUrl`
- `instagramUrl`

## Deploy (static hosting)

```bash
npm run build
```

Output is `dist/eastlanka/browser`.

### Netlify

This repo includes `netlify.toml` (SPA fallback to `index.html`). Connect the GitHub repo in Netlify, or drag the `dist/eastlanka/browser` folder into Netlify Drop.

### Vercel

This repo includes `vercel.json` with the same SPA rewrite. Import the project in Vercel, or run `npx vercel`.

## Phase 2 (later)

When you need live stock and an admin panel, replace `products.ts` with Firebase, Supabase, or your own API. The catalogue pages and WhatsApp flow can stay as they are.
