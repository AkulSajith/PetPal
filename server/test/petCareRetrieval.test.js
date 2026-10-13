import test from 'node:test';
import assert from 'node:assert/strict';

const {
  buildPetCareRetrievalIndex,
  loadPetCareKnowledgeDocuments,
  retrievePetCarePassages,
  searchPetCareIndex,
} = await import('../src/services/petCareRetrieval.service.js');

const documents = loadPetCareKnowledgeDocuments();
const index = buildPetCareRetrievalIndex(documents);

test('loads reviewed local documents while retaining the manual-review entry', () => {
  assert.equal(documents.length, 5);
  assert.equal(documents.find((document) => document.id === 'avma-pet-care')?.reviewStatus, 'manual-review');
  assert.equal(index.passages.some((passage) => passage.source.id === 'avma-pet-care'), false);
});

test('a dog diet question retrieves the Cornell nutrition passage', () => {
  const results = retrievePetCarePassages('Is a homemade diet complete and balanced for my dog?', { index });
  assert.equal(results[0]?.source.id, 'cornell-dog-diet');
  assert.match(results[0]?.text || '', /complete and balanced|home-prepared/i);
});

test('a dog-food transition question retrieves Cornell’s four-day schedule', () => {
  const results = retrievePetCarePassages('How many days should I take to transition my dog to new food?', { index });
  const transitionPassage = results.find((result) => /four-day food transition/i.test(result.text));

  assert.ok(transitionPassage);
  assert.equal(transitionPassage.source.id, 'cornell-dog-diet');
  assert.match(transitionPassage.text, /75% old food and 25% new food/i);
  assert.match(transitionPassage.text, /sensitive stomachs may need a longer/i);
  assert.doesNotMatch(transitionPassage.text, /7\s*[–-]\s*10 days/i);
});

test('an emergency question retrieves relevant emergency guidance when retrieval is exercised', () => {
  const results = retrievePetCarePassages('What warning signs like collapse or difficulty breathing are veterinary emergencies?', { index });
  assert.equal(results[0]?.source.id, 'cornell-emergency-critical-care');
  assert.match(results[0]?.text || '', /difficulty breathing|collapse/i);
});

test('a possible toxic-ingestion question retrieves poison-control guidance', () => {
  const results = retrievePetCarePassages('What should someone do after a possible toxic ingestion or poisoning?', { index });
  assert.equal(results[0]?.source.id, 'aspca-poison-control');
  assert.match(results[0]?.text || '', /poison|toxic/i);
});

test('an unrelated question does not receive irrelevant passages', () => {
  assert.deepEqual(retrievePetCarePassages('How do I center a div in a React component?', { index }), []);
});

test('citation metadata remains attached to the selected passage', () => {
  const [result] = retrievePetCarePassages('Should dog food be balanced for its life stage?', { index });
  assert.equal(result.source.title, 'Re-evaluating your dog’s diet');
  assert.match(result.source.publisher, /Cornell University/i);
  assert.equal(result.source.url, 'https://www.vet.cornell.edu/departments-centers-and-institutes/riney-canine-health-center/canine-health-information/re-evaluating-your-dog-s-diet');
  assert.match(result.passageId, /^cornell-dog-diet#p\d+$/);
  assert.ok(result.score > 0);
});

test('missing and empty knowledge bases are handled gracefully', () => {
  assert.deepEqual(loadPetCareKnowledgeDocuments('Z:/petpal/knowledge-that-does-not-exist'), []);
  assert.deepEqual(searchPetCareIndex(buildPetCareRetrievalIndex([]), 'dog diet'), []);
});

test('near-identical passages are not returned together', () => {
  const duplicateDocuments = [{
    id: 'fixture',
    title: 'Fixture',
    publisher: 'PetPal Test',
    url: 'https://example.com/fixture',
    topic: 'dog diet',
    reviewDate: '2026-10-14',
    reviewStatus: 'verified',
    keywords: ['dog', 'diet'],
    content: 'A balanced dog diet supports routine nutrition.\n\nA balanced dog diet supports routine nutrition.',
  }];
  const results = searchPetCareIndex(buildPetCareRetrievalIndex(duplicateDocuments), 'balanced dog diet', { minScore: 0 });
  assert.equal(results.length, 1);
});
