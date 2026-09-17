import type { APIRoute } from 'astro';

// Points crawlers at the sitemap @astrojs/sitemap generates at build time.
// Base-path aware, like everywhere else, so a fork or a renamed repo needs no edits.
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL(`${import.meta.env.BASE_URL}sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
};
