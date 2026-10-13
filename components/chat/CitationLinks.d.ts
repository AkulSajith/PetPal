import type { SafeChatCitation } from '../../lib/chatCitations.js';

export interface CitationLinksProps {
  citations?: SafeChatCitation[];
}

export default function CitationLinks(props: CitationLinksProps): JSX.Element | null;
