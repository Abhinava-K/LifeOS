import { Module } from '@nestjs/common';
import { MemoryController } from './memory.controller';
import { MemoryService } from './services/memory.service';
import { EmbeddingService } from './services/embedding.service';
import { ContextBuilderService } from './services/context-builder.service';

@Module({
  controllers: [MemoryController],
  providers: [MemoryService, EmbeddingService, ContextBuilderService],
  exports: [MemoryService, EmbeddingService, ContextBuilderService],
})
export class MemoryModule {}
