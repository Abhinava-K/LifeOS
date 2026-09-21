import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../database/redis.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

@Injectable()
export class SessionManagerService {
  private readonly logger = new Logger(SessionManagerService.name);
  private readonly inMemoryStore = new Map<string, ChatMessage[]>();
  private readonly DEFAULT_TTL_SECONDS = 86400; // 24 hours

  constructor(private readonly redisService: RedisService) {}

  private getRedisKey(userId: string, sessionId: string): string {
    return `chat_session:${userId}:${sessionId}`;
  }

  async appendMessage(
    userId: string,
    sessionId: string,
    message: ChatMessage,
  ): Promise<void> {
    const formattedMsg: ChatMessage = {
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
    };

    const key = this.getRedisKey(userId, sessionId);
    try {
      const existingStr = await this.redisService.get(key);
      let history: ChatMessage[] = [];
      if (existingStr) {
        history = JSON.parse(existingStr);
      }
      history.push(formattedMsg);

      // Keep max 30 recent messages in context window
      if (history.length > 30) {
        history = history.slice(-30);
      }

      await this.redisService.set(key, JSON.stringify(history), this.DEFAULT_TTL_SECONDS);
      this.inMemoryStore.set(key, history);
    } catch (error) {
      this.logger.warn(`Redis session write fallback to in-memory: ${(error as Error).message}`);
      const history = this.inMemoryStore.get(key) || [];
      history.push(formattedMsg);
      this.inMemoryStore.set(key, history.slice(-30));
    }
  }

  async getSessionHistory(
    userId: string,
    sessionId: string,
    limit: number = 20,
  ): Promise<ChatMessage[]> {
    const key = this.getRedisKey(userId, sessionId);
    try {
      const existingStr = await this.redisService.get(key);
      if (existingStr) {
        const history: ChatMessage[] = JSON.parse(existingStr);
        return history.slice(-limit);
      }
    } catch (error) {
      this.logger.warn(`Redis session read fallback to in-memory: ${(error as Error).message}`);
    }

    const memoryHistory = this.inMemoryStore.get(key) || [];
    return memoryHistory.slice(-limit);
  }

  async clearSession(userId: string, sessionId: string): Promise<boolean> {
    const key = this.getRedisKey(userId, sessionId);
    this.inMemoryStore.delete(key);
    try {
      await this.redisService.del(key);
      return true;
    } catch {
      return false;
    }
  }
}
