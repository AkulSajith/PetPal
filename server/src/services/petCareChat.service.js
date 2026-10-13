import { createPetCareSystemPrompt, PET_CARE_PROMPT_VERSION } from '../config/petCarePrompt.js';
import { sendOllamaChat } from './ollama.service.js';
import { retrievePetCarePassages } from './petCareRetrieval.service.js';
import { assessPetCareSafety } from './petCareSafety.service.js';

const QUANTITY_WORDS = 'a|an|few|several|couple(?:\\s+of)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve';
const QUANTITY_UNITS = '%|percent|minutes?|hours?|days?|weeks?|months?|years?|times?|meals?|servings?|doses?|milligrams?|mg|grams?|g|kilograms?|kg|milliliters?|ml|cups?|teaspoons?|tablespoons?|calories?';
const SPECIFIC_VALUE_PATTERN = new RegExp(
  `\\b(?:${QUANTITY_WORDS}|\\d+(?:\\.\\d+)?)(?:\\s*(?:-|–|—|to)\\s*(?:${QUANTITY_WORDS}|\\d+(?:\\.\\d+)?))?\\s*(?:-\\s*)?(?:${QUANTITY_UNITS})(?=\\s|[.,;:!?)]|$)`,
  'gi',
);

const NUMBER_WORD_VALUES = new Map([
  ['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6'],
  ['seven', '7'], ['eight', '8'], ['nine', '9'], ['ten', '10'], ['eleven', '11'], ['twelve', '12'],
]);

function canonicalSpecificValue(value) {
  let canonical = value.toLowerCase().replace(/[–—]/g, '-');
  for (const [word, number] of NUMBER_WORD_VALUES) {
    canonical = canonical.replace(new RegExp(`\\b${word}\\b`, 'g'), number);
  }
  return canonical
    .replace(/\bpercent\b/g, '%')
    .replace(/\bmilligrams?\b/g, 'mg')
    .replace(/\bgrams?\b/g, 'g')
    .replace(/\bkilograms?\b/g, 'kg')
    .replace(/\bmilliliters?\b/g, 'ml')
    .replace(/\b(minutes?|hours?|days?|weeks?|months?|years?|times?|meals?|servings?|doses?|cups?|teaspoons?|tablespoons?|calories?)\b/g, (unit) => unit.endsWith('s') ? unit.slice(0, -1) : unit)
    .replace(/\s+to\s+/g, '-')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSpecificValues(value) {
  return [...String(value || '').matchAll(SPECIFIC_VALUE_PATTERN)]
    .map((match) => canonicalSpecificValue(match[0]));
}

function enforceRetrievedSpecifics(message, passages) {
  if (typeof message !== 'string' || !message.trim()) return message;
  const supportedValues = new Set(extractSpecificValues(passages.map((passage) => passage.text).join('\n')));
  const claims = message.trim().split(/(?<=[.!?])\s+|\n+/).map((claim) => claim.trim()).filter(Boolean);
  let omittedUnsupportedClaim = false;

  const groundedClaims = claims.filter((claim) => {
    const values = extractSpecificValues(claim);
    const supported = values.every((value) => supportedValues.has(value));
    if (!supported) omittedUnsupportedClaim = true;
    return supported;
  });

  if (!omittedUnsupportedClaim) return message.trim();
  const notice = "PetPal's curated sources do not establish any additional specific number or timeframe for this answer.";
  return groundedClaims.length ? `${groundedClaims.join(' ')}\n\n${notice}` : notice;
}

function latestUserQuestion(messages) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content?.trim() || '';
}

function validRetrievedPassages(value) {
  return (Array.isArray(value) ? value : []).filter((passage) => (
    passage
    && typeof passage.passageId === 'string'
    && typeof passage.text === 'string'
    && passage.text.trim()
    && typeof passage.source?.id === 'string'
    && typeof passage.source?.title === 'string'
    && typeof passage.source?.publisher === 'string'
    && typeof passage.source?.url === 'string'
  ));
}

function citationsFor(passages) {
  const citations = new Map();
  for (const passage of passages) {
    if (citations.has(passage.source.id)) continue;
    citations.set(passage.source.id, {
      id: passage.source.id,
      title: passage.source.title,
      publisher: passage.source.publisher,
      url: passage.source.url,
      topic: passage.source.topic,
      passageId: passage.passageId,
    });
  }
  return [...citations.values()];
}

export async function createPetCareReply(messages, options = {}) {
  const safetyResult = assessPetCareSafety(messages);
  if (safetyResult) {
    return {
      message: safetyResult.response,
      urgent: safetyResult.type === 'emergency',
      source: 'safety',
      promptVersion: PET_CARE_PROMPT_VERSION,
      citations: [],
    };
  }

  const retrieve = options.retrieve || retrievePetCarePassages;
  const retrievedPassages = validRetrievedPassages(
    options.retrievedPassages || await retrieve(latestUserQuestion(messages)),
  );
  const trustedContext = [...retrievedPassages, ...(options.trustedContext || [])];
  const trustedMessages = [
    { role: 'system', content: createPetCareSystemPrompt(trustedContext) },
    ...messages.map(({ role, content }) => ({ role, content })),
  ];

  const ollamaChat = options.ollamaChat || sendOllamaChat;
  const generatedMessage = await ollamaChat(trustedMessages);
  const message = enforceRetrievedSpecifics(generatedMessage, retrievedPassages);

  return {
    message,
    urgent: false,
    source: retrievedPassages.length ? 'ollama-rag' : 'ollama',
    promptVersion: PET_CARE_PROMPT_VERSION,
    citations: citationsFor(retrievedPassages),
  };
}
