import { Injectable } from '@nestjs/common';
import { RecalledMemoryItemDto } from '@lifeos/shared-types';

@Injectable()
export class ContextBuilderService {
  /**
   * Formats a list of recalled memory items into a structured prompt context block
   * for LLM ingestion (Gemini, Groq, CrewAI).
   */
  formatMemoriesForPrompt(memories: RecalledMemoryItemDto[]): string {
    if (!memories || memories.length === 0) {
      return '';
    }

    const lines: string[] = [
      '<user_long_term_memory>',
      '# Relevant User Facts, Goals & Preferences from Long-Term Memory:',
    ];

    for (const mem of memories) {
      const tagStr = mem.tags?.length ? ` [${mem.tags.join(', ')}]` : '';
      lines.push(
        `- [${mem.category}] (Importance: ${mem.importance}/10, Relevance: ${(mem.combinedScore * 100).toFixed(0)}%): ${mem.content}${tagStr}`,
      );
    }

    lines.push('</user_long_term_memory>');
    return lines.join('\n');
  }

  /**
   * Builds an enriched system prompt by prepending long-term memory context
   * to an existing base instruction or prompt.
   */
  enrichPromptWithMemory(basePrompt: string, memoryContext: string): string {
    if (!memoryContext || memoryContext.trim().length === 0) {
      return basePrompt;
    }
    return `${memoryContext}\n\n${basePrompt}`;
  }
}
