import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { topicIds } from './site.config';

const source = z.object({
  /** Short id used to link a footnote to this entry: [Sam 1990](#ref-sam1990) */
  id: z.string(),
  author: z.string(),
  title: z.string(),
  /** Newspaper, journal, website or book series the work appeared in. */
  container: z.string().optional(),
  publisher: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  url: z.url().optional(),
  accessed: z.coerce.date().optional(),
  /** Language of the title, when it isn't English (e.g. "km", "fr"). */
  lang: z.string().optional(),
});

/**
 * One folder per page: `src/content/pages/<slug>/en.mdx`, `km.mdx`, `zh.mdx`.
 * Only the English file needs `hero`, `topic` and `sources`; translations inherit them.
 */
const pages = defineCollection({
  loader: glob({ pattern: '*/{en,km,zh}.mdx', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    /** The title in Khmer script, shown large in the hero. */
    nativeTitle: z.string().optional(),
    standfirst: z.string(),
    topic: z.enum(topicIds).optional(),
    format: z.enum(['story', 'photo-essay', 'interactive']).default('story'),
    published: z.coerce.date().optional(),
    updated: z.coerce.date().optional(),
    /** File name inside the page's images folder. Its credit comes from credits.yaml. */
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
    /** CSS object-position for the hero crop, e.g. "50% 20%". */
    heroPosition: z.string().optional(),
    /** original: written in this language. draft: machine-assisted, unreviewed. reviewed: checked by a native speaker. */
    translation: z.enum(['original', 'draft', 'reviewed']).default('original'),
    sources: z.array(source).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages };
