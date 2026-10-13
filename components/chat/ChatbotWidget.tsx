import React, { useEffect, useRef, useState } from 'react';
import { requestChatReply, type ChatCitation, type ChatMessage } from '../../lib/chatApi';
import { PawPrintIcon } from '../icons/PawPrintIcon';
import CitationLinks from './CitationLinks.js';

interface UiChatMessage extends ChatMessage {
  id: string;
  urgent?: boolean;
  citations?: ChatCitation[];
}

const STORAGE_KEY = 'petpal_chat_messages_v1';
const MAX_HISTORY_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;

const WELCOME_MESSAGE: UiChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I’m the PetPal care assistant. Ask me about everyday feeding, grooming, exercise, training, or routine wellness. I provide general information—not a diagnosis or prescription.',
};

const SUGGESTED_QUESTIONS = [
  'How often should I groom my dog?',
  'How can I help my cat drink more water?',
  'What is a healthy exercise routine for a puppy?',
];

function createMessage(role: ChatMessage['role'], content: string, urgent = false, citations: ChatCitation[] = []): UiChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    urgent,
    citations,
  };
}

function loadStoredMessages(): UiChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [WELCOME_MESSAGE];

    const messages = parsed
      .filter((item): item is UiChatMessage => (
        item
        && typeof item.id === 'string'
        && (item.role === 'user' || item.role === 'assistant')
        && typeof item.content === 'string'
        && item.content.trim().length > 0
      ))
      .map((item) => ({
        ...item,
        content: item.content.slice(0, MAX_MESSAGE_CHARS),
        citations: Array.isArray(item.citations)
          ? item.citations.filter((citation) => (
            citation
            && typeof citation.id === 'string'
            && typeof citation.title === 'string'
            && typeof citation.publisher === 'string'
            && typeof citation.url === 'string'
          )).slice(0, 3)
          : [],
      }))
      .slice(-MAX_HISTORY_MESSAGES);

    return messages.length ? messages : [WELCOME_MESSAGE];
  } catch {
    return [WELCOME_MESSAGE];
  }
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UiChatMessage[]>(loadStoredMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_HISTORY_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading, error]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const closeChat = () => {
    setIsOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  };

  const requestReply = async (history: UiChatMessage[]) => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const outbound = history
        .slice(-MAX_HISTORY_MESSAGES)
        .map(({ role, content }) => ({ role, content }));
      const reply = await requestChatReply(outbound, controller.signal);
      setMessages((current) => [
        ...current,
        createMessage('assistant', reply.message, reply.urgent, reply.citations),
      ].slice(-MAX_HISTORY_MESSAGES));
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
      setError(requestError instanceof Error ? requestError.message : 'PetPal AI could not answer right now.');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const submitMessage = (value: string) => {
    const content = value.trim();
    if (!content || isLoading) return;

    const nextMessages = [
      ...messages,
      createMessage('user', content.slice(0, MAX_MESSAGE_CHARS)),
    ].slice(-MAX_HISTORY_MESSAGES);

    setMessages(nextMessages);
    setInput('');
    void requestReply(nextMessages);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submitMessage(input);
    }
    if (event.key === 'Escape') closeChat();
  };

  const startNewConversation = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setError(null);
    setIsLoading(false);
    sessionStorage.removeItem(STORAGE_KEY);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const canRetry = Boolean(error) && messages.at(-1)?.role === 'user' && !isLoading;

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label="PetPal AI pet-care chat"
          className="mb-3 flex h-[min(70vh,38rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-brand-teal-100 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-brand-teal-700 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <PawPrintIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-bold">PetPal AI</h2>
                <p className="text-xs text-brand-teal-100">General pet-care guidance</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={startNewConversation}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
              >
                New Conversation
              </button>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close PetPal AI chat"
                className="rounded-lg p-2 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-brand-orange-50/50 p-4" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-brand-orange-500 text-white'
                      : message.urgent
                        ? 'rounded-bl-md border border-red-200 bg-red-50 text-red-800'
                        : 'rounded-bl-md border border-gray-100 bg-white text-gray-700'
                  }`}
                >
                  {message.urgent && <p className="mb-1 font-bold">Urgent veterinary guidance</p>}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  {message.role === 'assistant' && <CitationLinks citations={message.citations} />}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-gray-500">Try asking:</p>
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => submitMessage(question)}
                    className="block w-full rounded-xl border border-brand-teal-100 bg-white px-3 py-2 text-left text-xs text-brand-teal-700 hover:bg-brand-teal-50 focus:outline-none focus:ring-2 focus:ring-brand-teal-400"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-teal-500" />
                  PetPal AI is thinking…
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                <p>{error}</p>
                {canRetry && (
                  <button
                    type="button"
                    onClick={() => void requestReply(messages)}
                    className="mt-2 font-semibold underline underline-offset-2 hover:text-red-900"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-100 bg-white p-3">
            <label htmlFor="petpal-chat-input" className="sr-only">Ask a pet-care question</label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="petpal-chat-input"
                rows={1}
                maxLength={MAX_MESSAGE_CHARS}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ask about your pet…"
                className="max-h-28 min-h-11 flex-1 resize-y rounded-2xl border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-teal-500 focus:outline-none focus:ring-2 focus:ring-brand-teal-100 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send pet-care question"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-orange-500 text-white shadow-md hover:bg-brand-orange-600 focus:outline-none focus:ring-2 focus:ring-brand-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.949a.75.75 0 00.722.544h6.094a.25.25 0 010 .5H4.415a.75.75 0 00-.722.544l-1.414 4.95a.75.75 0 00.95.912l13.5-5.25a.75.75 0 000-1.398l-13.5-5.25a.75.75 0 00-.124-.038z" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-400">General guidance only. For emergencies, contact a veterinarian immediately.</p>
          </form>
        </section>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close PetPal AI chat' : 'Open PetPal AI chat'}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-500 text-white shadow-xl transition-transform hover:scale-105 hover:bg-brand-orange-600 focus:outline-none focus:ring-4 focus:ring-brand-orange-200 sm:h-16 sm:w-16"
      >
        {isOpen ? (
          <svg className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        ) : (
          <div className="relative">
            <PawPrintIcon className="h-8 w-8" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-brand-orange-500 bg-brand-teal-400" />
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
