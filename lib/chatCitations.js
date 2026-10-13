function safeCitationUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function normalizeChatCitation(value) {
  if (!value || typeof value !== 'object') return null;
  const url = safeCitationUrl(value.url);
  if (
    !url
    || typeof value.id !== 'string'
    || !value.id.trim()
    || typeof value.title !== 'string'
    || !value.title.trim()
    || typeof value.publisher !== 'string'
    || !value.publisher.trim()
  ) return null;

  return {
    id: value.id.trim(),
    title: value.title.trim(),
    publisher: value.publisher.trim(),
    url,
    ...(typeof value.topic === 'string' && value.topic.trim() ? { topic: value.topic.trim() } : {}),
    ...(typeof value.passageId === 'string' && value.passageId.trim() ? { passageId: value.passageId.trim() } : {}),
  };
}

export function normalizeChatCitations(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.map(normalizeChatCitation).filter((citation) => {
    if (!citation || seen.has(citation.id)) return false;
    seen.add(citation.id);
    return true;
  });
}

export { safeCitationUrl };
