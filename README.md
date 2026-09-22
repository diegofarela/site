# Diego Martinez — Portfolio Site

Presentation-only personal site. Thank you for reading this!!

## Run locally

From the parent workspace:

```bash
docker compose up
```

Or from this folder:

```bash
npx --yes serve -l 8080
```

## Dev tools

Controlled by `js/env.js` (`window.__PORTFOLIO_ENV__.DEV_TOOLS`).

| Environment | `DEV_TOOLS` | Behavior |
|-------------|-------------|----------|
| Local / Docker | `true` (committed default) | Tools on localhost; also `?dev=1` |
| GitHub Pages | `false` (set at deploy) | Tools never appear |

See `.env.example` (`PORTFOLIO_DEV_TOOLS`).

## Hosting (GitHub Pages)

1. Push this repo to GitHub (public)
2. **Settings → Pages → Source: GitHub Actions**
3. Optional repo variable `SITE_ORIGIN` for a custom domain

Deploy injects absolute `og:` / canonical URLs and forces `PORTFOLIO_DEV_TOOLS=false`.
