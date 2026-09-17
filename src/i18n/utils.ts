import { locales, type Locale } from '../site.config';
import { ui, type UIKey } from './ui';

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/**
 * Prefix a site path with the deploy base (e.g. `/cambodian-culture/`).
 * Always use this for internal links: a project site breaks on links that start with `/`.
 */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  const joined = `${base}/${clean}`;
  // trailingSlash is 'always' for pages; leave file paths (with an extension) and anchors alone.
  if (/\.[a-z0-9]+$/i.test(clean) || clean.includes('#') || joined.endsWith('/')) return joined;
  return `${joined}/`;
}

export function localeUrl(locale: Locale, path = ''): string {
  return url(`${locale}/${path.replace(/^\//, '')}`);
}

export function useTranslations(locale: Locale) {
  return function t(key: UIKey, vars: Record<string, string | number> = {}): string {
    let text: string = ui[locale][key] ?? ui.en[key];
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  };
}

/** BCP 47 tags for the `lang` attribute. */
export const htmlLang: Record<Locale, string> = { en: 'en', km: 'km', zh: 'zh-Hans' };

const intlLocale: Record<Locale, string> = { en: 'en-GB', km: 'km-KH', zh: 'zh-CN' };

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

export function khmerDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)]);
}

/** Numbers in the reader's script: Khmer numerals on Khmer pages. */
export function localNumber(value: number | string, locale: Locale): string {
  return locale === 'km' ? khmerDigits(value) : String(value);
}

export function formatDate(date: Date, locale: Locale): string {
  const text = new Intl.DateTimeFormat(intlLocale[locale], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(date);
  return locale === 'km' ? khmerDigits(text) : text;
}
