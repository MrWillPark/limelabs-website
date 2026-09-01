# Lime Labs Website

Static marketing site for [limelabs.dev](https://limelabs.dev).

## Local preview

```bash
npx serve .
```

Or open `index.html` directly in a browser.

## Deploy to Vercel

Connected to Vercel under the `mrwillpark` account. Production deploys run automatically on push to `main`.

Manual deploy:

```bash
npx vercel --prod
```

## Domain

`limelabs.dev` is configured in Vercel. DNS at Namecheap:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

Keep existing MX records for email (AWS inbound).
