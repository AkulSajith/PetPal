export interface SafeChatCitation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  topic?: string;
  passageId?: string;
}

export function safeCitationUrl(value: unknown): string | null;
export function normalizeChatCitation(value: unknown): SafeChatCitation | null;
export function normalizeChatCitations(value: unknown): SafeChatCitation[];
