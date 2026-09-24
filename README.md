# East Lanka

Product catalogue with WhatsApp ordering. The shop pages are a static Angular app. Facebook auto-post uses private Vercel API routes so the page token never ships to the browser.

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

## Facebook Page auto-post

Saving a **new** product can publish a photo post on the East Lanka Facebook Page. Editing a product does not post again.

The Page access token is encrypted with `FB_SETTINGS_KEY` and stored as a Cloudinary authenticated file (`offer-lanka/private/facebook-settings`). It is not written to git, `site-config.ts`, or the public catalogue.

### One-time Meta setup

1. Open [developers.facebook.com/apps](https://developers.facebook.com/apps) and create an app. Add the **Facebook Login** product.
2. The person who admins [facebook.com/eastlanka](https://www.facebook.com/eastlanka) must be an admin, developer, or tester on that app. Development mode is enough for this one page.
3. Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/), select the app, and generate a User access token with `pages_show_list`, `pages_manage_posts`, and `pages_read_engagement`.
4. Call `GET /me/accounts`. Copy the East Lanka **Page ID** and that page’s **access token**.
5. Exchange the short-lived user token for a long-lived one:

```text
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={app-id}
  &client_secret={app-secret}
  &fb_exchange_token={short-lived-user-token}
```

6. Call `GET /me/accounts` again with the long-lived user token. Put that Page ID and Page token in `.env`. Do not commit them.

### Vercel environment

Set these before auto-post works in production:

- `ADMIN_PASSWORD` — same password the admin types at `/admin/login`
- `FB_SETTINGS_KEY` — random string, at least 16 characters
- `FB_PAGE_ID` — East Lanka Page ID
- `FB_PAGE_ACCESS_TOKEN` — long-lived Page access token
- `FB_AUTO_POST` — `true` to post each new product
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_CLOUD_NAME` (optional, defaults to `derggujli`)
- `SITE_URL` — public site origin, no trailing slash (used in the post link)

Put `FB_PAGE_ID` and `FB_PAGE_ACCESS_TOKEN` in `.env` for local auto-post, and the same names in Vercel for production. There is no admin screen for the Facebook connection. Restart `npm start` after changing `.env`.

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
