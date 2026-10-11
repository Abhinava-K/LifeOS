import { Module } from '@nestjs/common';
import { GoogleSyncController } from './google-sync.controller';
import { GoogleSyncService } from './google-sync.service';
import { PlannerModule } from '../planner/planner.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [PlannerModule, DocumentsModule],
  controllers: [GoogleSyncController],
  providers: [GoogleSyncService],
  exports: [GoogleSyncService],
})
export class GoogleSyncModule {}
