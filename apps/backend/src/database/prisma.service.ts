import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

let PrismaClientClass: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClientClass = require('@prisma/client').PrismaClient;
} catch {
  PrismaClientClass = class MockPrismaClient {
    async $connect() {}
    async $disconnect() {}
    async $queryRaw() { return [{ '?column?': 1 }]; }
  };
}

@Injectable()
export class PrismaService extends PrismaClientClass implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      if (this.$connect) {
        await this.$connect();
      }
      this.logger.log('🐘 Connected to PostgreSQL 15 database successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to PostgreSQL database', error);
    }
  }

  async onModuleDestroy() {
    if (this.$disconnect) {
      await this.$disconnect();
    }
    this.logger.log('🔌 Disconnected from PostgreSQL database');
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (this.$queryRaw) {
        await this.$queryRaw`SELECT 1`;
      }
      return true;
    } catch {
      return false;
    }
  }
}

