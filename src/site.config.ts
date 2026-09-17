export const locales = ['en', 'km', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/**
 * Locales that actually get pages, language-switcher entries and hreflang links.
 * Khmer content and strings all stay in the repo (km.mdx files, ui.ts, this file's
 * topic names, inline `km=`/`nativeTitle` props on English and Chinese pages, the
 * Khmer fonts) — only the routed Khmer *translation* is switched off. Add 'km' back
 * here to bring it back.
 */
export const enabledLocales: Locale[] = locales.filter((l) => l !== 'km');

export const siteConfig = {
  /**
   * Cloudflare Web Analytics token, from a "Web Analytics" site added at
   * dash.cloudflare.com (Analytics & Logs → Web Analytics → Add a site → JavaScript snippet
   * → copy the `token` value; no DNS change needed). Leave empty to turn visitor tracking
   * off. Only counted on the live site, never in dev.
   */
  cloudflareAnalyticsToken: 'f1ee4b15f527481095edf600685fb3c2',
  /** First year of publication, shown in the footer. */
  since: 2026,
};

/** Topics in the order they appear on the home page. `mark` is the large Khmer word shown beside each. */
export const topics = [
  {
    id: 'arts',
    mark: 'សិល្បៈ',
    name: { en: 'Arts, dance & music', km: 'សិល្បៈ របាំ និងតន្ត្រី', zh: '艺术、舞蹈与音乐' },
    blurb: {
      en: 'Court dance, shadow theatre, the pinpeat orchestra and the songs of the 1960s.',
      km: 'របាំព្រះរាជទ្រព្យ ល្ខោនស្បែក វង់ភ្លេងពិណពាទ្យ និងចម្រៀងសម័យ ១៩៦០។',
      zh: '宫廷舞蹈、皮影戏、宾北乐队与1960年代的歌曲。',
    },
  },
  {
    id: 'temples',
    mark: 'ប្រាសាទ',
    name: { en: 'Temples & history', km: 'ប្រាសាទ និងប្រវត្តិសាស្ត្រ', zh: '寺庙与历史' },
    blurb: {
      en: 'Angkor and the kingdoms before and after it.',
      km: 'អង្គរ និងអាណាចក្រមុន និងក្រោយសម័យអង្គរ។',
      zh: '吴哥及其前后的王国。',
    },
  },
  {
    id: 'food',
    mark: 'ម្ហូប',
    name: { en: 'Food', km: 'ម្ហូបអាហារ', zh: '饮食' },
    blurb: {
      en: 'Amok, num banh chok, prahok and the markets that sell them.',
      km: 'អាម៉ុក នំបញ្ចុក ប្រហុក និងផ្សារដែលលក់ពួកវា។',
      zh: '阿莫克鱼、高棉米粉、鱼酱，以及出售它们的市场。',
    },
  },
  {
    id: 'festivals',
    mark: 'បុណ្យ',
    name: { en: 'Festivals & traditions', km: 'ពិធីបុណ្យ និងប្រពៃណី', zh: '节日与传统' },
    blurb: {
      en: 'Khmer New Year, Pchum Ben, the Water Festival and family ceremonies.',
      km: 'ចូលឆ្នាំខ្មែរ ភ្ជុំបិណ្ឌ បុណ្យអុំទូក និងពិធីក្នុងគ្រួសារ។',
      zh: '高棉新年、亡人节、送水节与家庭仪式。',
    },
  },
  {
    id: 'language',
    mark: 'អក្សរ',
    name: { en: 'Language & writing', km: 'ភាសា និងអក្សរ', zh: '语言与文字' },
    blurb: {
      en: 'The Khmer script, its inscriptions and the words behind everyday life.',
      km: 'អក្សរខ្មែរ សិលាចារឹក និងពាក្យពេចន៍ក្នុងជីវិតប្រចាំថ្ងៃ។',
      zh: '高棉文字、碑铭，以及日常生活中的词语。',
    },
  },
] as const;

export type TopicId = (typeof topics)[number]['id'];
export const topicIds = topics.map((t) => t.id) as [TopicId, ...TopicId[]];
