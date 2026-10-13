import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

function chatUrl(baseUrl) {
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL('chat', normalized).toString();
}

function upstreamError(status) {
  if (status === 401 || status === 403) {
    return new ApiError(503, 'PetPal AI authentication is not configured correctly. Please contact support.');
  }
  if (status === 429) {
    return new ApiError(429, 'PetPal AI is receiving too many requests. Please wait a moment and try again.');
  }
  if (status === 400 || status === 404) {
    return new ApiError(503, 'The configured PetPal AI model is unavailable. Please contact support.');
  }
  if (status >= 500) {
    return new ApiError(502, 'PetPal AI is temporarily unavailable. Please try again shortly.');
  }
  return new ApiError(502, 'PetPal AI could not process this request. Please try again.');
}

export async function sendOllamaChat(messages, options = {}) {
  const apiKey = options.apiKey ?? env.OLLAMA_API_KEY;
  const model = options.model ?? env.OLLAMA_MODEL;
  const baseUrl = options.baseUrl ?? env.OLLAMA_BASE_URL;
  const timeoutMs = options.timeoutMs ?? env.OLLAMA_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;

  if (!apiKey) {
    throw new ApiError(503, 'PetPal AI is not configured yet. Please try again later.');
  }
  if (!model) {
    throw new ApiError(503, 'PetPal AI does not have a configured model. Please contact support.');
  }
  if (typeof fetchImpl !== 'function') {
    throw new ApiError(503, 'PetPal AI is unavailable in this server environment.');
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchImpl(chatUrl(baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw upstreamError(response.status);

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError(502, 'PetPal AI returned an invalid response. Please try again.');
    }

    const content = payload?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new ApiError(502, 'PetPal AI returned an empty response. Please try again.');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (timedOut || error?.name === 'AbortError') {
      throw new ApiError(504, 'PetPal AI took too long to respond. Please try again.');
    }
    throw new ApiError(502, 'PetPal AI could not be reached. Please check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
}
