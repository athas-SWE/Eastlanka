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
- `image` Cloudinary public ID (for example `offer-lanka/products/headphones`)
- `description`
- `available`
- optional `originalPrice` (shows on Offers)
- optional `newArrival` (shows on New Arrivals and the home page)

Then rebuild or redeploy.

## Product images (Cloudinary)

Images are stored in Cloudinary folder `offer-lanka`. The website only uses the public cloud name — the API secret stays in `.env` and is never shipped to the browser.

1. Copy `.env.example` to `.env` and add the API key and secret.
2. Upload the current local assets once:

```bash
npm run cloudinary:upload
```

3. For new photos, open `/admin/media`, upload the file, then paste the public ID into `products.ts`.

The in-browser uploader uses an unsigned preset (`offer_lanka_unsigned`). Do not put `CLOUDINARY_API_SECRET` in Angular source.

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
