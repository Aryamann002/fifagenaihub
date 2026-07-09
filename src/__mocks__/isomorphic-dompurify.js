/**
 * Manual Jest mock for isomorphic-dompurify.
 * Provides a simple text-stripping implementation for testing
 * without loading the ESM-only browser dependencies.
 * NOTE: Plain JavaScript — no TypeScript syntax.
 */

const DOMPurify = {
  sanitize: function(html) {
    if (!html || typeof html !== 'string') return '';
    // Strip script tags for testing
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/gi, '');
  },
};

module.exports = DOMPurify;
module.exports.default = DOMPurify;
