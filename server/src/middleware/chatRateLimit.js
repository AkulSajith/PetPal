import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export function createChatRateLimiter({
  windowMs = env.CHAT_RATE_LIMIT_WINDOW_MS,
  maxRequests = env.CHAT_RATE_LIMIT_MAX,
  now = () => Date.now(),
} = {}) {
  const clients = new Map();

  return function chatRateLimiter(req, res, next) {
    const currentTime = now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let record = clients.get(key);

    if (!record || currentTime >= record.resetAt) {
      record = { count: 0, resetAt: currentTime + windowMs };
      clients.set(key, record);
    }

    record.count += 1;
    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.max(1, Math.ceil((record.resetAt - currentTime) / 1000));

    res.setHeader('RateLimit-Limit', String(maxRequests));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(resetSeconds));

    if (record.count > maxRequests) {
      res.setHeader('Retry-After', String(resetSeconds));
      return next(new ApiError(429, 'Too many chat requests. Please wait a moment and try again.'));
    }

    // Opportunistic cleanup keeps the single-process prototype map bounded.
    if (clients.size > 1000) {
      for (const [clientKey, clientRecord] of clients) {
        if (currentTime >= clientRecord.resetAt) clients.delete(clientKey);
      }
    }

    return next();
  };
}

export const chatRateLimit = createChatRateLimiter();
