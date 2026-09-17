// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import { footnoteLabels } from './src/lib/footnote-labels.mjs';

// On GitHub Actions the owner and repo name come from the environment, so the
// site works whether the repo is `cambodian-culture` or `<user>.github.io`.
const [owner, repo] = (process.env.GITHUB_REPOSITORY ?? 'your-username/cambodian-culture').split('/');
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

export default defineConfig({
  site: process.env.SITE_URL ?? `https://${owner.toLowerCase()}.github.io`,
  base: isUserSite ? '/' : `/${repo}`,
  trailingSlash: 'always',
  // Keep spaces between inline elements in prose (Astro 7 defaults to JSX rules).
  compressHTML: true,
  integrations: [mdx()],
  i18n: {
    // Khmer is disabled for now (kept in src/site.config.ts's full `locales` list, content
    // and strings untouched) — add 'km' back here too to re-enable the routed translation.
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  markdown: {
    processor: satteri({
      features: {
        gfm: { footnotes: { label: 'Notes', backLabel: 'Back to text', backContent: '↩' } },
        smartPunctuation: true,
      },
      hastPlugins: [footnoteLabels],
    }),
  },
  // Stacks are composed in src/styles/tokens.css (Latin, then Khmer, then Chinese, then one
  // generic), so each font is registered without its own fallbacks.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Bodoni Moda',
      cssVariable: '--font-bodoni',
      weights: ['400 900'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: 'Literata',
      cssVariable: '--font-literata',
      weights: ['300 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: 'Moul',
      cssVariable: '--font-moul',
      weights: [400],
      styles: ['normal'],
      subsets: ['khmer'],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: 'Noto Serif Khmer',
      cssVariable: '--font-noto-khmer',
      weights: ['300 800'],
      styles: ['normal'],
      subsets: ['khmer'],
      fallbacks: [],
    },
    {
      provider: fontProviders.google(),
      name: 'Noto Serif SC',
      cssVariable: '--font-noto-sc',
      weights: [400, 900],
      styles: ['normal'],
      subsets: ['chinese-simplified'],
      fallbacks: [],
    },
  ],
});
