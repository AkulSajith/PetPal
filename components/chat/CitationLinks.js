import React from 'react';
import { safeCitationUrl } from '../../lib/chatCitations.js';

export default function CitationLinks({ citations = [] }) {
  const safeCitations = citations
    .map((citation) => ({ ...citation, safeUrl: safeCitationUrl(citation?.url) }))
    .filter((citation) => citation.safeUrl);

  if (!safeCitations.length) return null;

  return React.createElement(
    'div',
    { className: 'mt-3 border-t border-brand-teal-100 pt-2' },
    React.createElement('p', { className: 'text-[11px] font-bold uppercase tracking-wide text-brand-teal-700' }, 'Sources'),
    React.createElement(
      'ul',
      { className: 'mt-1 space-y-1.5' },
      safeCitations.map((citation) => React.createElement(
        'li',
        { key: citation.id },
        React.createElement(
          'a',
          {
            href: citation.safeUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-xs font-semibold text-brand-teal-700 underline decoration-brand-orange-300 underline-offset-2 hover:text-brand-teal-900 focus:outline-none focus:ring-2 focus:ring-brand-orange-300',
          },
          citation.title,
        ),
        React.createElement('span', { className: 'block text-[10px] text-gray-500' }, citation.publisher),
      )),
    ),
    React.createElement('p', { className: 'mt-2 text-[10px] leading-snug text-gray-500' }, 'Sources provide general grounding and do not guarantee medical accuracy.'),
  );
}
