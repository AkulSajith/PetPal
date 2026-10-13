import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DEFAULT_K1 = 1.2;
const DEFAULT_B = 0.75;
const DEFAULT_LIMIT = 3;
const DEFAULT_MIN_SCORE = 1.5;
const MAX_PASSAGE_CHARS = 700;
const DEFAULT_KNOWLEDGE_DIRECTORY = fileURLToPath(new URL('../knowledge/pet-care/', import.meta.url));

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'before', 'but',
  'by', 'can', 'could', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'may', 'my', 'of', 'on', 'or', 'our', 'should',
  'so', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to',
  'was', 'we', 'what', 'when', 'where', 'which', 'who', 'will', 'with', 'would', 'you', 'your',
]);

function normalizeToken(token) {
  let normalized = token.toLowerCase().replace(/[’']/g, '');
  if (normalized.length > 5 && normalized.endsWith('ies')) normalized = `${normalized.slice(0, -3)}y`;
  else if (normalized.length > 5 && normalized.endsWith('ing')) normalized = normalized.slice(0, -3);
  else if (normalized.length > 4 && normalized.endsWith('ed')) normalized = normalized.slice(0, -2);
  else if (normalized.length > 4 && normalized.endsWith('s') && !normalized.endsWith('ss')) normalized = normalized.slice(0, -1);
  return normalized;
}

export function tokenizePetCareText(value) {
  if (typeof value !== 'string') return [];
  return (value.match(/[\p{L}\p{N}]+/gu) || [])
    .map(normalizeToken)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function splitLongParagraph(paragraph, maxChars) {
  if (paragraph.length <= maxChars) return [paragraph];
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const next = `${current} ${sentence.trim()}`.trim();
    if (current && next.length > maxChars) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function splitKnowledgeDocuments(documents, options = {}) {
  const maxChars = options.maxPassageChars || MAX_PASSAGE_CHARS;
  const passages = [];

  for (const document of Array.isArray(documents) ? documents : []) {
    if (document?.reviewStatus !== 'verified' || typeof document.content !== 'string' || !document.content.trim()) continue;
    const paragraphs = document.content.split(/\n\s*\n/g).map((item) => item.trim()).filter(Boolean);
    const chunks = paragraphs.flatMap((paragraph) => splitLongParagraph(paragraph, maxChars));

    chunks.forEach((text, index) => {
      passages.push({
        passageId: `${document.id}#p${index + 1}`,
        text,
        source: {
          id: document.id,
          title: document.title,
          publisher: document.publisher,
          url: document.url,
          topic: document.topic,
          reviewDate: document.reviewDate,
          geographicScope: document.geographicScope,
        },
        anchorText: [document.topic, ...(document.keywords || [])].join(' '),
        searchText: [text, document.title, document.topic, ...(document.keywords || [])].join(' '),
      });
    });
  }

  return passages;
}

function isValidKnowledgeDocument(document) {
  if (!document || typeof document !== 'object') return false;
  if (!['verified', 'manual-review'].includes(document.reviewStatus)) return false;
  if (![document.id, document.title, document.publisher, document.url, document.topic, document.reviewDate].every((value) => typeof value === 'string' && value.trim())) return false;
  try {
    return new URL(document.url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function loadPetCareKnowledgeDocuments(directoryPath = DEFAULT_KNOWLEDGE_DIRECTORY) {
  try {
    return readdirSync(directoryPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((entry) => {
        try {
          const document = JSON.parse(readFileSync(`${directoryPath}/${entry.name}`, 'utf8'));
          return isValidKnowledgeDocument(document) ? document : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function termFrequency(tokens) {
  const counts = new Map();
  for (const token of tokens) counts.set(token, (counts.get(token) || 0) + 1);
  return counts;
}

export function buildPetCareRetrievalIndex(documents = loadPetCareKnowledgeDocuments()) {
  const passages = splitKnowledgeDocuments(documents).map((passage) => {
    const tokens = tokenizePetCareText(passage.searchText);
    return {
      ...passage,
      tokens,
      anchorTokens: new Set(tokenizePetCareText(passage.anchorText)),
      termFrequency: termFrequency(tokens),
      length: tokens.length,
    };
  });
  const documentFrequency = new Map();

  for (const passage of passages) {
    for (const token of new Set(passage.tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  return {
    passages,
    documentFrequency,
    averageLength: passages.length
      ? passages.reduce((total, passage) => total + passage.length, 0) / passages.length
      : 0,
  };
}

function jaccardSimilarity(left, right) {
  const a = new Set(tokenizePetCareText(left));
  const b = new Set(tokenizePetCareText(right));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / (a.size + b.size - intersection);
}

export function searchPetCareIndex(index, query, options = {}) {
  if (!index?.passages?.length) return [];
  const queryTerms = [...new Set(tokenizePetCareText(query))];
  if (!queryTerms.length) return [];

  const limit = options.limit || DEFAULT_LIMIT;
  const minScore = options.minScore ?? DEFAULT_MIN_SCORE;
  const k1 = options.k1 || DEFAULT_K1;
  const b = options.b || DEFAULT_B;
  const totalPassages = index.passages.length;

  const scored = index.passages.filter((passage) => (
    queryTerms.some((term) => passage.anchorTokens.has(term))
  )).map((passage) => {
    let score = 0;
    for (const term of queryTerms) {
      const frequency = passage.termFrequency.get(term) || 0;
      if (!frequency) continue;
      const containing = index.documentFrequency.get(term) || 0;
      const inverseDocumentFrequency = Math.log(1 + ((totalPassages - containing + 0.5) / (containing + 0.5)));
      const lengthNormalization = frequency + k1 * (1 - b + b * (passage.length / index.averageLength));
      score += inverseDocumentFrequency * ((frequency * (k1 + 1)) / lengthNormalization);
    }
    return { ...passage, score };
  }).filter((passage) => passage.score >= minScore)
    .sort((left, right) => right.score - left.score || left.passageId.localeCompare(right.passageId));

  const selected = [];
  for (const candidate of scored) {
    const duplicate = selected.some((existing) => jaccardSimilarity(existing.text, candidate.text) >= 0.78);
    if (!duplicate) selected.push({
      passageId: candidate.passageId,
      text: candidate.text,
      source: candidate.source,
      score: Number(candidate.score.toFixed(4)),
    });
    if (selected.length >= limit) break;
  }

  return selected;
}

let defaultIndex;

export function retrievePetCarePassages(query, options = {}) {
  const index = options.index || (defaultIndex ||= buildPetCareRetrievalIndex());
  return searchPetCareIndex(index, query, options);
}

export const PET_CARE_RETRIEVAL_DEFAULTS = Object.freeze({
  method: 'BM25 lexical retrieval',
  limit: DEFAULT_LIMIT,
  minScore: DEFAULT_MIN_SCORE,
});
