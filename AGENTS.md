# Cambodian Culture Archive: project context

Context for anyone (human or AI model) coding on this repo. `CLAUDE.md` is a symlink to this file.

## What this is

**Cambodian Culture Archive** (Khmer: បណ្ណសារវប្បធម៌ខ្មែរ, Chinese: 柬埔寨文化档案馆) is a static site of long, illustrated, fully sourced pages about Cambodian arts, history, food, festivals and language. It is built with Astro, deployed to GitHub Pages, and multilingual (English, Khmer, Chinese).

- **Audience:** general readers, Cambodian and international.
- **Page style:** long scrolling stories, not paginated. Chapters open with full-width plum "chapter gates". Photos float beside the text, alternating right and left, like a magazine. The pages also mix in photo runs, pull quotes, a timeline, interactive explainers, YouTube videos, numbered footnotes and a reference list.
- **Pages published so far:** one, "The Royal Ballet of Cambodia" (`src/content/pages/apsara-royal-ballet/`), in en, km and zh.
- **Topics:** Arts, dance & music (has content), Temples & history, Food, Festivals & traditions, and Language & writing. The last four show "Coming later" on the home page.

## Stack and versions

| Piece | Details |
|---|---|
| Framework | Astro **7.3.x** (Rust compiler, Vite 8) with `@astrojs/mdx` 8 |
| Markdown | Astro 7's default **Sätteri** processor (`@astrojs/markdown-satteri`), **not** remark/rehype. GFM footnotes and smart punctuation are on. Plugins are Sätteri `hastPlugins` (see `src/lib/footnote-labels.mjs`). |
| Fonts | Astro Fonts API (`fonts` in `astro.config.mjs` plus `<Font>` in the layout), Google provider, self-hosted at build time |
| Images | `astro:assets` (`<Image>`, `getImage`) with sharp |
| Types | TypeScript strict. `npm run check` runs `astro check` and should report 0 errors. |
| Styling | Plain CSS: global tokens plus component-scoped `<style>`. No Tailwind, no UI framework. Interactivity is small vanilla TS `<script>`s inside components. |
| Data | `yaml` package, used to parse image `credits.yaml` files |
| Node | 22+ |

## Commands

```sh
npm install
npm run dev        # http://localhost:4321/cambodian-culture/en/
npm run build      # static output to dist/
npm run preview    # serve dist/
npm run check      # astro check (types + diagnostics)
npm run image -- "File:Name.jpg" <page-folder> <short-name> [--width 2000]   # fetch a Wikimedia Commons image + credit
```

When starting the dev server as an agent, use background mode: `astro dev --background`. Manage it with `astro dev stop`, `astro dev status` and `astro dev logs`. `.claude/launch.json` has an `astro-dev` config for preview tools.

**Known dev quirk:** after editing component `<style>` blocks, the dev server sometimes keeps serving stale CSS. Restart it if a style change doesn't show up. `npm run build` is always accurate.

## Directory map

```
astro.config.mjs            site/base (derived from GITHUB_REPOSITORY), trailingSlash 'always', compressHTML true,
                            i18n (en/km/zh, prefixDefaultLocale), Sätteri + footnote plugin, fonts
.github/workflows/deploy.yml  withastro/action@v6 → actions/deploy-pages@v5 on push to main
scripts/fetch-commons.mjs   Commons API download + license allowlist + resize + writes credits.yaml
docs/WRITING.md             author guide (adding pages, images, sources, translations, publishing, analytics)
docs/page-template.mdx      starter MDX for a new page
public/favicon.svg          gold flame on plum

src/
  site.config.ts            locales, topics (id, Khmer mark word, names/blurbs in 3 langs), cloudflareAnalyticsToken
  content.config.ts         "pages" collection schema (glob */{en,km,zh}.mdx)
  env.d.ts                  App.Locals: locale, pageSlug, figureCount
  i18n/ui.ts                all interface strings in en/km/zh (km/zh are drafts), language names
  i18n/utils.ts             url() and localeUrl() (base-path safe), useTranslations(), khmerDigits(), localNumber(), formatDate(), htmlLang
  lib/pages.ts              getLocalizedPages(): every page × locale with fallback, reading time
  lib/media.ts              getMedia(slug, name): image + credit (throws if either is missing), getPageCredits, getAllCredits
  lib/footnote-labels.mjs   Sätteri hast plugin that localizes the footnote heading/back-link per file (en/km/zh)
  layouts/BaseLayout.astro  <html lang>, meta/OG/hreflang, fonts, Analytics, Header/Footer; props: locale, title, description, path, available, ogImage, headerTone ('plum'|'cotton'), current ('home'|'about')
  styles/tokens.css         color + type tokens (see Design system)
  styles/global.css         reset, base type, :lang rules, .layout-grid (used by about/credits/404), .badge, .sr-only, Khmer no-italic rule
  styles/prose.css          story body: .prose flow column, .span-wide/.span-full breakouts, footnotes, end sections, footnote preview bubble
  pages/
    index.astro             root language chooser; JS redirects to /km/, /zh/ or /en/ from navigator.languages
    404.astro
    [locale]/index.astro    home: big Khmer title, featured page (photo left, text right), topics list, latest pages (when >1)
    [locale]/[slug].astro   story page: sets Astro.locals, renders MDX with the components map, References, ImageCredits, NextRead, ReadingThread, Lightbox, footnote hover-preview script
    [locale]/topics/[topic].astro
    [locale]/about.astro    sourcing/images/videos/languages/analytics policy (texts inline, 3 langs)
    [locale]/credits.astro  all image credits grouped by page
  components/
    site/   Header (Home/Topics/About + aria-current), LanguageSwitcher, Footer, Breadcrumbs, PageRow, Analytics
    story/  StoryHero, ChapterGate, KbachBorder, Figure, PhotoSequence, PullQuote, Term, Timeline, TimelineItem, Video, Credit, Lightbox, ReadingThread
    interactive/ KbachExplorer (hand-gesture explorer, Royal Ballet page)
    end/    References, ImageCredits, NextRead
  content/pages/<slug>/
    en.mdx, km.mdx, zh.mdx  one file per language (only en is required)
    credits.yaml            image filename → { title, author, date?, license, licenseUrl?, source }
    images/                 page images; images/gestures/ holds the 8 hand-gesture photos
```

Routes: `/<base>/` (language chooser), `/<base>/{en|km|zh}/`, `/<base>/{locale}/{slug}/`, `/<base>/{locale}/topics/{topic}/`, `/<base>/{locale}/about/`, `/<base>/{locale}/credits/`, `/<base>/404.html`. **Don't name a page folder `about`, `credits` or `topics`.**

## How the core pieces work

### Multilingual (flexible per page)
- Locales are `en` (default, written first), `km` and `zh`. Every URL has a locale prefix.
- `getLocalizedPages()` builds every slug in all 3 locales. If `slug/km.mdx` is missing, the English entry renders at `/km/slug/` with a fallback notice. The notice text is in `ui.ts`, and the article gets `lang="en"`.
- Translation files only need `title`, `standfirst`, `heroAlt` and `translation`. They inherit `hero`, `topic`, `published` and `sources` from the English entry (`base`).
- `translation: draft` shows a "Draft translation" badge and note. Change it to `reviewed` after a native speaker checks the page. **All km and zh text in the repo (pages, ui.ts, site.config.ts, component labels) is currently an AI draft.**
- The language switcher only lists locales where the page exists, plus the current one.
- Components inside MDX read `Astro.locals.locale` and `Astro.locals.pageSlug`, which the `[slug].astro` route sets. Always use `url()` or `localeUrl()` for internal links: the site is deployed under a base path.
- Wrap any Khmer or Chinese text inside other-language content in `lang="km"` or `lang="zh"`. Fonts and line heights depend on it.

### Content collection frontmatter (`src/content.config.ts`)
`title`, `nativeTitle?` (Khmer title shown big in the hero), `standfirst`, `topic?` (enum from site.config), `format` ('story'|'photo-essay'|'interactive'), `published?`, `updated?`, `hero?` (file name in `images/`), `heroAlt?`, `heroPosition?`, `translation` ('original'|'draft'|'reviewed'), `sources?[]` ({ id, author, title, container?, publisher?, year?, url?, accessed?, lang? }), `draft` (bool, hides the page in production).

### Images and credits
- Every image is looked up by file name through `getMedia(slug, name)`, which uses an `import.meta.glob` of `src/content/pages/*/images/**`. The build **fails** if the file or its `credits.yaml` entry is missing.
- `npm run image` only accepts Public domain, CC0, "No restrictions", CC BY and CC BY-SA. It refuses NC, ND and unknown licenses, resizes to max 2000px and writes the credit.
- **Exception, and a legal note:** the 8 hand-gesture photos in `images/gestures/` come from Yosothor (*Khmer Renaissance*, article 67). They are **copyrighted** and credited as "© Yosothor" with a link to the article; the owner chose to use them. Permission from Yosothor has not been obtained yet. The About page says some photos belong to their publishers.
- `ImageCredits` lists everything in the page's `credits.yaml`. Remove unused credit entries when you delete images.

### Footnotes and references
- Write GFM footnotes in MDX: `claim.[^key]` in text and `[^key]: [Author 2020](#ref-sourceid), detail.` at the bottom. Footnotes work inside JSX children (captions, TimelineItem).
- `References` renders `sources` with `id="ref-<id>"`, so footnotes link to `#ref-<id>`.
- The footnote heading and back-link label are localized by `lib/footnote-labels.mjs`, based on the file name (`en.mdx`, `km.mdx`, `zh.mdx`).
- `[slug].astro` has a script that previews a footnote in a bubble on hover or focus.
- Reading time is estimated from the base entry body (words / 230).

### Story layout (`.prose` in `styles/prose.css`)
- The body is a **normal block-flow column** (`width: min(66ch, 100% - 2*gutter)`), not a grid, so floats work.
- Breakouts: `.prose > .span-full` is 100vw (ChapterGate, KbachExplorer) and `.prose > .span-wide` is up to 64rem (Timeline, PhotoSequence). Both have `clear: both`.
- **Components that break out must only set `margin-block`.** Setting `margin: X 0` would override the breakout's inline margins.
- `Figure` floats at 48% width (portraits 36%) from 600px up and alternates right/left using `Astro.locals.figureCount`, reset per page. `align` overrides the side. Figures `clear: both`. Below 600px they're full column width. From 1100px they hang 4rem into the margin.
- **Place a `<Figure>` just before the paragraphs it should sit beside.** Too little text beside a float leaves a gap before the next breakout.
- `PullQuote` is a normal-width grid block (a block formatting context) with `min-width: min(100%, 20rem)`. It sits beside a float when there's room, otherwise drops below.

### MDX components (registered in `src/pages/[locale]/[slug].astro`, used without imports)
| Component | Props / notes |
|---|---|
| `<ChapterGate n title km? lede? image? imagePosition? />` | Full-width plum band. The gold `KbachBorder` draws in once when scrolled into view (IntersectionObserver, `.js` class, respects reduced motion). The chapter number is in Khmer numerals. The optional background photo is tinted and credited in the corner. |
| `<Figure name alt align? position? aspect?>caption</Figure>` | Floated photo, credit line, click opens the Lightbox (`data-lightbox`). `size` is no longer used. |
| `<PhotoSequence label items={[{name, alt, caption, position?}]} />` | Horizontal scroll-snap run of 15rem cards with prev/next buttons, inside the wide column |
| `<PullQuote cite>quote</PullQuote>` | Large italic Bodoni quote (bold reading font for Khmer) |
| `<Term km roman? show?="km"\|"roman">definition</Term>` | Inline tappable Khmer word with a popover. Markup is kept on one line to avoid stray spaces. |
| `<Timeline>` + `<TimelineItem year title>markdown</TimelineItem>` | Gold thread with diamonds. Years become Khmer numerals on km pages. Put blank lines around the markdown inside items. |
| `<Video id title channel seconds? start? hd?>caption</Video>` | YouTube facade: the thumbnail comes from i.ytimg.com (`sddefault`, or `maxresdefault` if `hd`). On click it swaps in a `youtube-nocookie.com` iframe with autoplay. Without JS it's a link to YouTube. |
| `<KbachExplorer />` | Peacock-teal full-width band with 8 photo chips (Pech Tum Kravel's sequence: sprouting, shoot, leaf, branch, flower, kdeb = budding fruit, mature fruit, ripe fruit falling) and a detail panel (photo, stage "n of 8", Khmer name, romanization, name, meaning, credit). Data and 3-language text live in the component; photos are `images/gestures/0N-*.jpg`. |

Other page-level components: `StoryHero` (breadcrumbs "Home › Topic", Khmer native title, title, standfirst, date, reading time, draft badge and notes; arched-niche photo beside the text from 700px), `ReadingThread` (fixed gold progress line on the left from 1200px, with chapter marks; hidden over the hero), `Lightbox` (one shared `<dialog>`), `NextRead`, `References`, `ImageCredits`.

## Design system (keep it consistent)

**Look:** "Royal silk & kbach": plum silk, palace gold, peacock teal, unbleached cotton, with the kbach phni tes flame ornament.

| Token | Hex | Use |
|---|---|---|
| `--silk-plum` | #3b1631 | heroes, chapter gates, video frames, NextRead |
| `--plum-deep` | #280e21 | footer |
| `--peacock` / `--peacock-deep` | #0f5257 / #0a3c40 | links, footnote markers, explorer band |
| `--palace-gold` | #c9971c | ornament and text **on plum/dark only** (fails contrast on cotton) |
| `--gold-pale` | #e9cf8a | small text on plum/teal |
| `--gold-deep` | #8a6510 | gold text on cotton (4.5:1) |
| `--cotton` / `--cotton-deep` | #f3ece0 / #e7dcc9 | reading background / subtle panels |
| `--ink` / `--ink-soft` | #1d1a1f / #4a4148 | body / secondary text |

**Weave (`src/styles/global.css`):** a very faint diagonal-crosshatch silk texture, almost transparent. It's `var(--weave)` (two `repeating-linear-gradient`s) prepended to a surface's own `background`, with `background-blend-mode: overlay` — never a page-covering overlay element. That keeps it strictly part of each surface's own paint, so it can't sit above a photo or a line of text (backgrounds always paint behind an element's content). Every component with a plain `--silk-plum`/`--plum-deep`/`--cotton` background includes it: `body`, `.hero`, `.gate`, `.video`, `.next`, `.intro`, `.topic-head`, `.site-footer`, `.choose`. Add it the same way to any new flat-colour surface. Off under `prefers-reduced-transparency`, `forced-colors` and print.

**Type:**
- **Display:** Bodoni Moda (Latin), then Moul (Khmer headline face, one weight, only at large sizes), then Noto Serif SC 900 (Chinese).
- **Reading:** Literata, then Noto Serif Khmer, then Noto Serif SC.
- Stacks are composed in `tokens.css`, which is why each font is registered with `fallbacks: []`. Noto Serif SC only loads on `/zh/` pages.
- **Scale:** 14/16/18/21/24/36/48/72/96px as `--step-*` (the larger steps use `clamp`).
- **Line height:** English 1.6, Khmer 1.9, Chinese 1.8.
- **Khmer:** no italics (global rule switches `em` to weight 600). Small Khmer headings use the reading font at weight 700, not Moul.

**Silk glass (`src/styles/glass.css`):** every button, control and pop-up uses a plain frosted, silk-tinted glass surface — blur + tint + a thin gold-toned border on rounded corners. No SVG, no masks, no illustration; earlier arch/flame/flourish versions were tried and dropped.
- Add `glass` to an element, plus optional `glass--teal`, `glass--light` (cotton glass with a deep-gold edge), `glass--strong` (denser plum, for panels over text) or `glass--panel` (a smaller, more rectangular corner radius, for dropdowns and pop-ups).
- **Shape:** `--k-radius` defaults to `999px` (a full pill/stadium), which also makes any equal-sided icon button a perfect circle for free. Panels override it smaller (e.g. `--k-radius: 1rem`) since a pill looks wrong on a tall or wide rectangle — set it per element when a surface isn't a short-label button (see `.chip` in KbachExplorer.astro).
- **Tuning:** override `--k-tint`, `--k-tint-hover`, `--k-edge` (an RGB triple) and `--k-radius` on the element.
- **How it's built:** background, border and `backdrop-filter` sit directly on the element itself — no pseudo-elements needed now that there's no mask to keep separate from the edge. If an element has an absolutely-positioned child (e.g. a badge), give that element its own `position: relative`; `.glass` no longer supplies one implicitly.
- **Fallback:** readers with `prefers-reduced-transparency`, or browsers without backdrop-filter, get solid silk.
- **Where it's used:** "Read the page", the language button and menu, gesture chips, the video play button (gold glass), photo-run arrows, the lightbox close button, the footnote preview and the Khmer word bubble.
- **Header:** sticky glass from 700px up (static on phones), with a plain fading gold hairline at the bottom. Pages with a plum header get a plum band behind the top of `body`, so the glass matches the hero before you scroll.
- The pointed temple-niche arch still exists as a **photo** frame (story hero, home featured photo, the large selected-gesture photo in KbachExplorer) — that's separate from `.glass` and untouched.

**Principles:**
- **One signature motion:** the chapter-gate ornament draws in. Everything else moves only in response to the reader. Respect `prefers-reduced-motion`.
- **Khmer script is the headline art.**
- **Every image carries its credit.**
- **The arch** (temple-niche shape) is a recurring frame: story hero photo, home featured photo, gesture chips.
- **Avoid generic template tells:** no all-caps eyebrow labels, no identical card grids with soft shadows, no "→" on links, no terracotta accent, no middle-dot meta strings.
- **Accessibility:** visible focus, `lang` attributes, alt text on content images (decorative ones get `alt=""`), no horizontal scroll down to 375px.

## Content and sourcing rules

- Every factual claim gets a footnote pointing to a source in frontmatter `sources`. Research **both Khmer- and English-language sources**, which the owner explicitly wants. Prefer Cambodian institutions and scholars, UNESCO and museums. When a source is weak (e.g. uncited Wikipedia), say so in the note.
- Don't copy source text; write in your own words, with short attributed quotes only.
- Where sources disagree or a popular explanation is recent, the page says so. Example: the plant-cycle reading of the gestures dates from Pech Tum Kravel (2001), per Yosothor.
- The owner rejected the Kampuchea Thmey "8 gestures" article as inaccurate. It was removed as a source; use Yosothor article 67 for gestures.
- Current Royal Ballet sources:
  - UNESCO ICH listing
  - Yosothor, *Khmer Renaissance*: Preap Chanmara (article 42) and Mien Sovanna & Neang Sovanntara (article 67)
  - Devata.org inventory (Kent Davis)
  - Musée Rodin
  - Cultural Survival Quarterly 14.3 (1990): Sam-Ang Sam, Eileen Blumenthal
  - Khmer Wikipedia (Apsara dance, flagged as uncited) and English Wikipedia (Buppha Devi, Kbach)
  - Cambodianess (Apr 2026)
  - UNESCO article on *The Perfect Motion* (2024)
- The page's 4 videos:

  | Video | Channel |
  |---|---|
  | *The Perfect Motion* trailer (EpIgGZQYuII) | aloestproductions |
  | Apsara basics lesson (OmGlC6Njr-I) | Iana Komarnytska |
  | *Robam Apsara: The Wonder of Angkor* (KI74c3olQIU) | The Royal Ballet of Cambodia |
  | Full Apsara performance at Angkor Wat (5V22sJji2pg) | SLICE |

  Before adding a video, check it can be embedded with `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` (a 200 response means it can).

## Adding a new page (short version; full guide in docs/WRITING.md)

1. `mkdir src/content/pages/<slug>` and copy `docs/page-template.mdx` to `en.mdx`.
2. Add images with `npm run image -- "File:…" <slug> <short-name>`, or add files by hand with a `credits.yaml` entry.
3. Write the chapters with the components above. Put each `<Figure>` before its paragraphs, footnote every claim, and fill `sources`.
4. Optionally add `km.mdx` and `zh.mdx` with `translation: draft`.
5. Run `npm run check` and `npm run build`. Check en/km/zh at 375px, 768px and 1280px.

New interactive blocks go in `src/components/interactive/` and must be added to the `components` map in `src/pages/[locale]/[slug].astro`.

## Deployment and analytics status

- **Not deployed yet.** There's no git repo or GitHub remote yet, and the `gh` CLI isn't logged in.
- **Plan:** a GitHub repo named `cambodian-culture`, pushed to `main`, with Settings → Pages → Source set to "GitHub Actions". It publishes at `https://<user>.github.io/cambodian-culture/`. `site` and `base` come from `GITHUB_REPOSITORY` at build time; `SITE_URL` can override.
- **Cloudflare Web Analytics:** set `cloudflareAnalyticsToken` in `src/site.config.ts` (currently empty, so tracking is off). The script only loads in production builds. It's cookie-free, so no consent banner is needed, and it doesn't require the domain to use Cloudflare's DNS.

## Open to-dos

- A native speaker needs to review all Khmer and Chinese text: pages, `ui.ts`, `site.config.ts`, and the labels in KbachExplorer, About and Video.
- Ask Yosothor for permission to use the gesture photos, or replace them.
- Watch the chosen YouTube videos to confirm they fit.
- Photos on phones are still full column width, not floated; this is intentional.
- Write pages for the other four topics.

## Astro docs

Full documentation: https://docs.astro.build. Consult these before related work:

- [Routing](https://docs.astro.build/en/guides/routing/)
- [Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Markdown (Sätteri processor, plugins)](https://docs.astro.build/en/guides/markdown-content/)
- [Images](https://docs.astro.build/en/guides/images/)
- [Fonts](https://docs.astro.build/en/guides/fonts/)
- [Styling](https://docs.astro.build/en/guides/styling/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
- [Upgrading to v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
