const HYPOTHETICAL_MARKERS = /\b(hypothetically|in general|for future reference|what if|would it|could it|how (?:can|do|would) i recognize|signs of|symptoms of)\b/i;
const CURRENT_MARKERS = /\b(right now|currently|just now|today|won't stop|keeps|repeated|my (?:dog|cat|pet|puppy|kitten) (?:is|has|can't|cannot|just|ate|swallowed|ingested|collapsed|fell|was hit))\b/i;
const HISTORICAL_MARKERS = /\b(last year|months? ago|weeks? ago|previously|history of|used to)\b/i;

const EMERGENCY_RULES = [
  {
    reason: 'difficulty breathing',
    test: (text) => /\b(can't|cannot|struggling to|difficulty|trouble|not)\s+(?:breathe|breathing)\b|\bgasping for air\b|\bblue (?:gums|tongue)\b/i.test(text),
  },
  {
    reason: 'collapse or loss of consciousness',
    test: (text) => /\b(collapsed|unconscious|unresponsive|passed out|lost consciousness)\b/i.test(text),
  },
  {
    reason: 'an active or repeated seizure',
    test: (text) => /\b(having a seizure|is seizing|seizing now|seizure (?:right now|won't stop|lasting)|repeated seizures|multiple seizures)\b/i.test(text),
  },
  {
    reason: 'uncontrolled bleeding',
    test: (text) => /\b(uncontrolled bleeding|bleeding heavily|won't stop bleeding|blood is pouring)\b/i.test(text),
  },
  {
    reason: 'possible poisoning or toxic ingestion',
    test: (text) => /\b(poisoned|toxic ingestion)\b/i.test(text)
      || /\b(ate|swallowed|ingested|drank|licked|chewed)\b.{0,100}\b(poison|toxin|chocolate|xylitol|grapes?|raisins?|antifreeze|rat poison|pesticide|medication|medicine|pills?|ibuprofen|paracetamol|acetaminophen)\b/i.test(text),
  },
  {
    reason: 'severe trauma',
    test: (text) => /\b(hit by (?:a )?car|run over|severe trauma|major injury|fell from (?:a )?(?:balcony|roof|window)|attacked by (?:a )?(?:dog|animal))\b/i.test(text),
  },
  {
    reason: 'possible heatstroke',
    test: (text) => /\b(heatstroke|heat stroke)\b/i.test(text)
      || /\b(overheating|very hot)\b.{0,80}\b(collapse|vomiting|confused|unresponsive|heavy panting)\b/i.test(text),
  },
  {
    reason: 'abdominal swelling with unsuccessful retching',
    test: (text) => /\b(swollen|bloated|distended)\b.{0,60}\b(stomach|abdomen|belly)\b/i.test(text)
      && /\b(retching|trying to vomit|trying to throw up|dry heaving)\b/i.test(text),
  },
  {
    reason: 'inability to urinate',
    test: (text) => /\b(can't|cannot|unable to|struggling to)\s+(?:urinate|pee)\b|\bstraining to (?:urinate|pee)\b.{0,50}\b(nothing|no urine|only drops)\b/i.test(text),
  },
];

const MEDICATION_REQUEST = /\b(dose|dosage|how much|how many|milligrams?|\d+\s*mg|prescribe|calculate)\b.{0,100}\b(medicine|medication|drug|antibiotic|painkiller|ibuprofen|paracetamol|acetaminophen|aspirin|tablet|pill)\b|\b(how much|what dose)\b.{0,100}\b(?:give|administer)\b/i;

function latestUserMessage(messages) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content?.trim() || '';
}

function isClearlyHypothetical(text) {
  if (CURRENT_MARKERS.test(text)) return false;
  return HYPOTHETICAL_MARKERS.test(text) || HISTORICAL_MARKERS.test(text);
}

export function assessPetCareSafety(messages) {
  const text = latestUserMessage(messages);
  if (!text) return null;

  if (!isClearlyHypothetical(text)) {
    const emergency = EMERGENCY_RULES.find((rule) => rule.test(text));
    if (emergency) {
      return {
        type: 'emergency',
        reason: emergency.reason,
        response: `This may be a veterinary emergency (${emergency.reason}). Contact the nearest emergency veterinarian or animal hospital immediately and begin traveling there now. Do not wait for chat advice. If it is safe to do so, call the clinic while you are on the way. Do not give food or medication, and do not induce vomiting, unless a veterinarian or animal poison professional specifically directs you.`,
      };
    }
  }

  if (MEDICATION_REQUEST.test(text)) {
    return {
      type: 'medication',
      response: 'I can’t prescribe medication or calculate an individualized dose. Drug safety and dosing depend on the animal, weight, health history, formulation, and diagnosis, so please contact a veterinarian who can assess your pet. If your pet has already swallowed a human medicine or an unknown amount, contact an emergency veterinarian immediately.',
    };
  }

  return null;
}

export const PET_CARE_SAFETY_LIMITATION = 'Keyword-based screening can miss emergencies or produce false alarms; it does not replace veterinary triage.';
