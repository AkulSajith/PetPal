import test from 'node:test';
import assert from 'node:assert/strict';

const { assessPetCareSafety, PET_CARE_SAFETY_LIMITATION } = await import('../src/services/petCareSafety.service.js');

test('allows an ordinary pet-care question to continue to the model', () => {
  assert.equal(assessPetCareSafety([{ role: 'user', content: 'How often should I brush my beagle?' }]), null);
});

test('recognizes a current breathing emergency', () => {
  const result = assessPetCareSafety([{ role: 'user', content: "My dog can't breathe right now." }]);
  assert.equal(result.type, 'emergency');
  assert.match(result.response, /emergency veterinarian/i);
  assert.match(result.response, /do not wait/i);
});

test('recognizes inability to urinate as an emergency', () => {
  const result = assessPetCareSafety([{ role: 'user', content: "My cat can't pee and keeps straining." }]);
  assert.equal(result.type, 'emergency');
});

test('does not label a clearly hypothetical emergency question as current', () => {
  const result = assessPetCareSafety([{ role: 'user', content: 'For future reference, what if a dog ate chocolate?' }]);
  assert.equal(result, null);
});

test('blocks individualized medication dosage requests', () => {
  const result = assessPetCareSafety([{ role: 'user', content: 'What dose of ibuprofen can I give my dog?' }]);
  assert.equal(result.type, 'medication');
  assert.match(result.response, /can’t prescribe medication/i);
});

test('documents the limitations of keyword screening', () => {
  assert.match(PET_CARE_SAFETY_LIMITATION, /can miss emergencies/i);
  assert.match(PET_CARE_SAFETY_LIMITATION, /does not replace veterinary triage/i);
});
