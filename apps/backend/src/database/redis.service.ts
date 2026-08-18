import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    this.client
      .connect()
      .then(() => {
        this.logger.log(`⚡ Connected to Redis instance at ${host}:${port}`);
      })
      .catch((err) => {
        this.logger.warn(`⚠️ Redis initial connection deferred: ${err.message}`);
      });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('🔌 Disconnected from Redis instance');
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch {
      return 0;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }
}
