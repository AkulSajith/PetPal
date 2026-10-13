import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/petpal_test';

const { createChatRateLimiter } = await import('../src/middleware/chatRateLimit.js');

function runMiddleware(middleware, ip = '127.0.0.1') {
  const headers = {};
  let nextError;
  middleware(
    { ip, socket: {} },
    { setHeader: (name, value) => { headers[name] = value; } },
    (error) => { nextError = error; },
  );
  return { headers, nextError };
}

test('rate limits repeated chat requests and resets after the window', () => {
  let currentTime = 1000;
  const limiter = createChatRateLimiter({ windowMs: 1000, maxRequests: 2, now: () => currentTime });

  assert.equal(runMiddleware(limiter).nextError, undefined);
  assert.equal(runMiddleware(limiter).nextError, undefined);

  const blocked = runMiddleware(limiter);
  assert.equal(blocked.nextError.statusCode, 429);
  assert.equal(blocked.headers['Retry-After'], '1');

  currentTime = 2001;
  assert.equal(runMiddleware(limiter).nextError, undefined);
});
