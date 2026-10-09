# xyrtik

TikTok media downloader built with Next.js App Router, TypeScript, and TikWM API.

## Requirements

- Node.js 20.9 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Production build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Use the default Next.js framework preset and deploy. No environment variables are required for the public TikWM endpoint.

## Notes

- The app calls TikWM from a Next.js Route Handler, not directly from the browser.
- TikWM availability, rate limits, returned fields, and media URLs are controlled by the third-party service.
- Photo slide items are opened individually in new tabs. Browser download behavior can vary by device and by the remote server's CORS/headers.
- Download only content you have permission to save. Respect creator rights, privacy, and platform terms.
- `package.json` uses current major/minor version ranges as configured for this starter. Run `npm install` and `npm outdated` before production release to verify registry availability.
