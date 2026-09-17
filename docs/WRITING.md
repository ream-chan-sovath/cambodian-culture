# Writing for the Cambodian Culture Archive

A step-by-step guide to adding a page, its images, its sources and its translations.

## 1. Start the site on your computer

```sh
npm install
npm run dev
```

Open http://localhost:4321/cambodian-culture/en/ in a browser. Pages update as you save.

## 2. Create the page folder

Every page lives in its own folder. The folder name is the web address.

```
src/content/pages/
  royal-ballet/          ← folder name = /en/royal-ballet/
    en.mdx               ← English (write this first)
    km.mdx               ← Khmer (optional)
    zh.mdx               ← Chinese (optional)
    credits.yaml         ← image credits (made for you by `npm run image`)
    images/              ← the page's images
```

Copy `docs/page-template.mdx` to `src/content/pages/<your-slug>/en.mdx` and fill in the top section (the "frontmatter"). The comments in the template explain each field.

## 3. Add images (with credits)

Find an image on [Wikimedia Commons](https://commons.wikimedia.org). Copy its file name (it starts with `File:`), then run:

```sh
npm run image -- "File:Apsara dancers Siem Reap 20091118 03.jpg" royal-ballet hero-dancer
```

That's: the Commons file name, your page folder, and a short name for the image. The script:

- only accepts public domain, CC0, CC BY and CC BY-SA images, and refuses anything else
- downloads a resized copy into `images/`
- writes the author, licence and source link into `credits.yaml`

Use the image in your page by its short name: `<Figure name="hero-dancer.jpg" alt="…">`.

**The site won't build if an image has no credit.** If you add an image from somewhere else (for example, your own photo), add an entry to `credits.yaml` by hand:

```yaml
my-photo.jpg:
  title: Morning at Psar Thmei
  author: Your Name
  license: CC BY 4.0
  licenseUrl: https://creativecommons.org/licenses/by/4.0
  source: https://your-site-or-profile
```

## 4. Cite sources

Two layers work together:

1. **References** go in the frontmatter under `sources:`. Each has an `id`.
2. **Notes** go in the text: write `[^name]` after a claim, then define the note at the bottom of the file:

```md
The school reopened in 1981.[^sam-school]

[^sam-school]: [Sam 1990](#ref-sam), p. 12.
```

The link `#ref-sam` jumps to the reference whose `id` is `sam`. Notes are numbered automatically, show a preview on hover, and link back to the text.

Good habits:

- Prefer Cambodian institutions and scholars, UNESCO and museum records. Read Khmer sources as well as English ones.
- When a source is weak (for example, an uncited Wikipedia claim), say so in the note.
- Don't copy text from sources. Write it in your own words, and keep direct quotes short.
- Use `lang: km` on sources with Khmer titles so they display correctly.

## 5. Building blocks

| Block | What it does |
|---|---|
| `<ChapterGate n={1} title="…" km="…" image="optional.jpg" />` | Full-width plum divider that opens a chapter. The gold border draws in as it scrolls into view. |
| `<Figure name="…" alt="…" align="left\|right">Caption</Figure>` | A photo that sits beside the text, with caption and automatic credit. Photos alternate right and left unless you set `align`. Place it just **before** the paragraphs it should sit beside. Click to view larger. |
| `<PhotoSequence label="…" items={[…]} />` | A sideways-scrolling run of small photos, for photo-essay passages. |
| `<PullQuote cite="…">Quote</PullQuote>` | A large quotation. |
| `<Term km="…" roman="…">Meaning</Term>` | A Khmer word the reader can tap for script and meaning. |
| `<Timeline>` + `<TimelineItem year="…" title="…">` | Dated moments on a gold thread. |
| `<Video id="…" title="…" channel="…" seconds={123} hd>Caption</Video>` | A YouTube video that plays on the page. `id` is the part after `watch?v=`. Only the thumbnail shows until the reader presses play. Add `hd` if the video has a high-resolution thumbnail. |
| `<KbachExplorer />` | The interactive hand-gesture guide (Royal Ballet page), using the photos in `images/gestures/`. |

To make a new interactive block, add an `.astro` file in `src/components/interactive/` and register it in the `components` list in `src/pages/[locale]/[slug].astro`.

## 6. Translations

- Write `en.mdx` first. Khmer and Chinese files only need `title`, `standfirst`, `heroAlt` and `translation`; they reuse the English hero, topic, date and sources.
- `translation: draft` shows a "Draft translation" badge. Change it to `reviewed` once a native speaker has checked the page.
- If a language file is missing, readers of that language see the English page with a short notice, and the language switcher hides that language on the page.
- Menu and button text lives in `src/i18n/ui.ts`. The Khmer and Chinese text there is also a draft.
- Topic names are in `src/site.config.ts`.

## 7. Publish

Commit and push to `main`. GitHub Actions builds the site and publishes it in about two minutes. Check progress in the repo's **Actions** tab.

```sh
git add .
git commit -m "Add page: <title>"
git push
```

## 8. Visitor counts

The site uses [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/): free, no cookies, no consent banner, and it doesn't require the domain to use Cloudflare's DNS.

1. Sign up at dash.cloudflare.com, then go to Analytics & Logs → Web Analytics → Add a site.
2. Choose "I don't have a Cloudflare account for this site" (or add the domain) and copy the `token` value from the JavaScript snippet it gives you.
3. Put that token in `src/site.config.ts` → `cloudflareAnalyticsToken`.
4. Push. Visits to the live site show up in your Cloudflare dashboard. Visits from `npm run dev` are never counted.
