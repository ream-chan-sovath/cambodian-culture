import type { ImageMetadata } from 'astro';
import YAML from 'yaml';

export interface Credit {
  title: string;
  author: string;
  date?: string;
  license: string;
  licenseUrl?: string;
  source: string;
}

const imageModules = import.meta.glob<{ default: ImageMetadata }>('/src/content/pages/*/images/**/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

const creditFiles = import.meta.glob<string>('/src/content/pages/*/credits.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const creditsByPage: Record<string, Record<string, Credit>> = {};
for (const [file, raw] of Object.entries(creditFiles)) {
  const slug = file.split('/').at(-2)!;
  creditsByPage[slug] = YAML.parse(raw) ?? {};
}

/** An image from a page folder plus its credit. Fails the build if either is missing. */
export function getMedia(slug: string, name: string): { image: ImageMetadata; credit: Credit } {
  const module = imageModules[`/src/content/pages/${slug}/images/${name}`];
  if (!module) throw new Error(`Image "${name}" not found in src/content/pages/${slug}/images/`);
  const credit = creditsByPage[slug]?.[name];
  if (!credit) {
    throw new Error(
      `Image "${name}" in "${slug}" has no credit. Add it with scripts/fetch-commons.mjs or write an entry in src/content/pages/${slug}/credits.yaml.`,
    );
  }
  return { image: module.default, credit };
}

export function getPageCredits(slug: string): [string, Credit][] {
  return Object.entries(creditsByPage[slug] ?? {});
}

export function getAllCredits(): [string, [string, Credit][]][] {
  return Object.entries(creditsByPage).map(([slug, credits]) => [slug, Object.entries(credits)]);
}
