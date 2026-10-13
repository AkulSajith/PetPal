import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import CitationLinks from '../../components/chat/CitationLinks.js';
import { normalizeChatCitations } from '../../lib/chatCitations.js';

test('frontend citation normalization accepts HTTPS sources and rejects unsafe URLs', () => {
  const citations = normalizeChatCitations([
    { id: 'safe', title: 'Trusted source', publisher: 'PetPal Test', url: 'https://example.com/source' },
    { id: 'unsafe', title: 'Unsafe source', publisher: 'PetPal Test', url: 'javascript:alert(1)' },
  ]);

  assert.equal(citations.length, 1);
  assert.equal(citations[0].id, 'safe');
});

test('frontend renders a valid citation as escaped text in a safe new-tab link', () => {
  const html = renderToStaticMarkup(CitationLinks({ citations: [{
    id: 'source-1',
    title: '<img src=x onerror=alert(1)>',
    publisher: 'Trusted Publisher',
    url: 'https://example.com/reference',
  }] }));

  assert.match(html, /href="https:\/\/example\.com\/reference"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /do not guarantee medical accuracy/i);
});
