# Cambodian Culture Archive · បណ្ណសារវប្បធម៌ខ្មែរ

Long, illustrated, fully sourced pages about Cambodian arts, history and everyday life, in English, Khmer and Chinese. Built with [Astro](https://astro.build) and published on GitHub Pages.

## Quick start

```sh
npm install
npm run dev        # http://localhost:4321/cambodian-culture/en/
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run image -- "File:Name.jpg" <page-folder> <short-name>   # add a Commons image with its credit
```

To write a new page, see **[docs/WRITING.md](docs/WRITING.md)**.

## How it's organised

```
src/
  content/pages/<slug>/     one folder per page: en.mdx, km.mdx, zh.mdx, credits.yaml, images/
  components/story/         chapter gates, figures, photo sequences, quotes, timeline, Khmer terms
  components/interactive/   interactive explainers (e.g. the kbach hand-gesture guide)
  components/site/          header, language switcher, footer, Analytics
  i18n/                     interface text in three languages, link helpers
  pages/                    routes: /[locale]/, /[locale]/[slug]/, topics, about, credits
  styles/                   design tokens, global and long-form reading styles
  site.config.ts            topics, Cloudflare Analytics token
scripts/fetch-commons.mjs   downloads Commons images and records their licences
```

## Publishing on GitHub Pages

1. Create a GitHub repository named `cambodian-culture` and push this folder to `main`.
2. In the repo, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes the site to `https://<your-username>.github.io/cambodian-culture/`.

The site and base path are worked out from the repository name during the build, so a fork or a renamed repo works without edits.

## Visitor tracking

Set `cloudflareAnalyticsToken` in `src/site.config.ts` (see docs/WRITING.md). Counting is cookie-free and only happens on the live site.

## Licences

Text © Cambodian Culture Archive. Images belong to their creators and are used under the licences listed with each image and on the image credits page.
