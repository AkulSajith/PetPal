import { normalizeChatCitations, type SafeChatCitation } from './chatCitations.js';

export type ChatRole = 'user' | 'assistant';
export type ChatCitation = SafeChatCitation;

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatReply {
  message: string;
  urgent: boolean;
  promptVersion: string;
  citations: ChatCitation[];
}

export class ChatApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export async function requestChatReply(messages: ChatMessage[], signal?: AbortSignal): Promise<ChatReply> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ChatApiError('PetPal AI could not be reached. Make sure the backend is running and try again.', 0);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ChatApiError('PetPal AI returned an unreadable response. Please try again.', response.status);
  }

  if (!response.ok) {
    const message = typeof payload === 'object'
      && payload !== null
      && 'error' in payload
      && typeof payload.error === 'object'
      && payload.error !== null
      && 'message' in payload.error
      && typeof payload.error.message === 'string'
      ? payload.error.message
      : 'PetPal AI could not answer right now. Please try again.';
    throw new ChatApiError(message, response.status);
  }

  const data = typeof payload === 'object' && payload !== null && 'data' in payload ? payload.data : null;
  if (
    typeof data !== 'object'
    || data === null
    || !('message' in data)
    || typeof data.message !== 'string'
    || !data.message.trim()
  ) {
    throw new ChatApiError('PetPal AI returned an invalid response. Please try again.', response.status);
  }

  return {
    message: data.message.trim(),
    urgent: 'urgent' in data && data.urgent === true,
    promptVersion: 'promptVersion' in data && typeof data.promptVersion === 'string' ? data.promptVersion : 'unknown',
    citations: 'citations' in data ? normalizeChatCitations(data.citations) : [],
  };
}
