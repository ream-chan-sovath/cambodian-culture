import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLocale, enabledLocales, type Locale } from '../site.config';

export type PageEntry = CollectionEntry<'pages'>;

export interface LocalizedPage {
  slug: string;
  /** The language the reader asked for. */
  locale: Locale;
  /** The entry actually shown: the requested language, or a fallback. */
  entry: PageEntry;
  /** The page in its source language: supplies hero, topic, sources and dates to translations. */
  base: PageEntry;
  isFallback: boolean;
  available: Locale[];
  readingMinutes: number;
}

function localeOf(entry: PageEntry): Locale {
  return entry.id.split('/').at(-1) as Locale;
}

function slugOf(entry: PageEntry): string {
  return entry.id.split('/')[0];
}

function readingMinutes(entry: PageEntry): number {
  const text = (entry.body ?? '')
    .replace(/^import .*$/gm, '')
    .replace(/^\[\^[^\]]+\]:.*$/gm, '')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Every page in every language, with missing translations filled by the source language. */
export async function getLocalizedPages(): Promise<LocalizedPage[]> {
  const entries = (await getCollection('pages')).filter((e) => import.meta.env.DEV || !e.data.draft);
  const bySlug = new Map<string, Map<Locale, PageEntry>>();
  for (const entry of entries) {
    const slug = slugOf(entry);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(localeOf(entry), entry);
  }

  const result: LocalizedPage[] = [];
  for (const [slug, versions] of bySlug) {
    const base =
      versions.get(defaultLocale) ?? [...versions.values()].find((v) => v.data.translation === 'original') ?? [...versions.values()][0];
    const available = enabledLocales.filter((l) => versions.has(l));
    for (const locale of enabledLocales) {
      const entry = versions.get(locale) ?? base;
      result.push({
        slug,
        locale,
        entry,
        base,
        isFallback: !versions.has(locale),
        available,
        readingMinutes: readingMinutes(base),
      });
    }
  }
  return result.sort((a, b) => (b.base.data.published?.getTime() ?? 0) - (a.base.data.published?.getTime() ?? 0));
}

export async function getPagesFor(locale: Locale): Promise<LocalizedPage[]> {
  return (await getLocalizedPages()).filter((p) => p.locale === locale);
}

export function sourceLocale(page: LocalizedPage): Locale {
  return localeOf(page.entry);
}
