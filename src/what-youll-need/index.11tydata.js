import { DOC_GROUPS } from '../assets/js/lib/content.js';

export default {
  eleventyComputed: {
    schema: (data) => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: DOC_GROUPS.map((g) => ({
        '@type': 'Question',
        name: `What documents do you need ${g.title.replace(/^If /i, 'if ').toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: g.items.join('; ')
        }
      }))
    })
  }
};
