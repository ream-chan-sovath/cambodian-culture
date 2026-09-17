// Localize the footnote heading and back-link label per file (en.mdx, km.mdx, zh.mdx).
// The Markdown processor only takes one global label, so this swaps it in after rendering.

const labels = {
  en: { heading: 'Notes', back: 'Back to text' },
  km: { heading: 'កំណត់សម្គាល់', back: 'ត្រឡប់ទៅអត្ថបទ' },
  zh: { heading: '注释', back: '返回正文' },
};

function localeFor(fileURL) {
  const match = fileURL?.pathname.match(/\/(en|km|zh)\.mdx?$/);
  return match ? match[1] : 'en';
}

export const footnoteLabels = {
  name: 'footnote-labels',
  element: [
    {
      filter: ['h2'],
      visit(node, ctx) {
        if (node.properties?.id !== 'footnote-label') return;
        const { heading } = labels[localeFor(ctx.fileURL)];
        ctx.replaceNode(node, {
          type: 'element',
          tagName: 'h2',
          properties: { id: 'footnote-label', className: ['footnotes-title'] },
          children: [{ type: 'text', value: heading }],
        });
      },
    },
    {
      filter: ['a'],
      visit(node, ctx) {
        const props = node.properties ?? {};
        if (!('dataFootnoteBackref' in props)) return;
        ctx.setProperty(node, 'ariaLabel', labels[localeFor(ctx.fileURL)].back);
      },
    },
  ],
};
