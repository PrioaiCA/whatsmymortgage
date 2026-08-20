import { TERMS } from '../assets/js/lib/content.js';

export default {
  eleventyComputed: {
    schema: (data) => ({
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: 'Mortgage Glossary',
      description: 'Plain-language definitions for mortgage terms, decoded.',
      url: data.site.url + '/mortgage-glossary/',
      hasDefinedTerm: Object.entries(TERMS).map(([key, [label, def]]) => ({
        '@type': 'DefinedTerm',
        name: label,
        description: def,
        url: data.site.url + '/mortgage-glossary/#' + key
      }))
    })
  }
};
