/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by the page route so components inside MDX know where they are. */
    locale?: import('./site.config').Locale;
    pageSlug?: string;
    /** Counts figures on the page so they can alternate right and left. */
    figureCount?: number;
  }
}
