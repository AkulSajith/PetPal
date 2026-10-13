import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/petpal_test';

const { sendOllamaChat } = await import('../src/services/ollama.service.js');

const messages = [{ role: 'system', content: 'Trusted prompt' }, { role: 'user', content: 'Hello' }];
const baseOptions = {
  apiKey: 'test-key',
  model: 'account-supported-model',
  baseUrl: 'https://ollama.com/api',
  timeoutMs: 100,
};

test('uses the cloud chat endpoint, bearer authentication, selected model, and non-streaming mode', async () => {
  let captured;
  const answer = await sendOllamaChat(messages, {
    ...baseOptions,
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ message: { role: 'assistant', content: 'Hello from Ollama' } }), { status: 200 });
    },
  });

  const body = JSON.parse(captured.options.body);
  assert.equal(answer, 'Hello from Ollama');
  assert.equal(captured.url, 'https://ollama.com/api/chat');
  assert.equal(captured.options.headers.Authorization, 'Bearer test-key');
  assert.equal(body.model, 'account-supported-model');
  assert.equal(body.stream, false);
  assert.deepEqual(body.messages, messages);
});

test('fails safely when the API key is missing', async () => {
  await assert.rejects(
    sendOllamaChat(messages, { ...baseOptions, apiKey: '' }),
    (error) => error.statusCode === 503 && /not configured yet/i.test(error.message),
  );
});

test('fails safely when the model is missing', async () => {
  await assert.rejects(
    sendOllamaChat(messages, { ...baseOptions, model: '' }),
    (error) => error.statusCode === 503 && /configured model/i.test(error.message),
  );
});

for (const [name, status, expectedStatus, pattern] of [
  ['authorization failure', 401, 503, /authentication is not configured correctly/i],
  ['rate limit', 429, 429, /too many requests/i],
  ['unsupported model', 404, 503, /configured PetPal AI model is unavailable/i],
  ['upstream server failure', 500, 502, /temporarily unavailable/i],
]) {
  test(`maps ${name} to a safe client error`, async () => {
    await assert.rejects(
      sendOllamaChat(messages, {
        ...baseOptions,
        fetchImpl: async () => new Response('sensitive upstream body', { status }),
      }),
      (error) => error.statusCode === expectedStatus
        && pattern.test(error.message)
        && !error.message.includes('sensitive upstream body'),
    );
  });
}

test('rejects an invalid upstream response body', async () => {
  await assert.rejects(
    sendOllamaChat(messages, {
      ...baseOptions,
      fetchImpl: async () => new Response('not-json', { status: 200 }),
    }),
    (error) => error.statusCode === 502 && /invalid response/i.test(error.message),
  );
});

test('maps network failures to a safe error', async () => {
  await assert.rejects(
    sendOllamaChat(messages, {
      ...baseOptions,
      fetchImpl: async () => { throw new Error('socket details that must stay private'); },
    }),
    (error) => error.statusCode === 502
      && /could not be reached/i.test(error.message)
      && !error.message.includes('socket details'),
  );
});

test('aborts and reports an upstream timeout', async () => {
  const fetchImpl = (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    }, { once: true });
  });

  await assert.rejects(
    sendOllamaChat(messages, { ...baseOptions, timeoutMs: 5, fetchImpl }),
    (error) => error.statusCode === 504 && /too long/i.test(error.message),
  );
});
