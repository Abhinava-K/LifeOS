import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiGatewayModule } from './ai-gateway/ai-gateway.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DocumentsModule } from './documents/documents.module';
import { ExpensesModule } from './expenses/expenses.module';
import { GoogleSyncModule } from './google-sync/google-sync.module';
import { MemoryModule } from './memory/memory.module';
import { NotesModule } from './notes/notes.module';
import { PlannerModule } from './planner/planner.module';
import { SearchModule } from './search/search.module';
import { StudyModule } from './study/study.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ExpensesModule,
    AiGatewayModule,
    PlannerModule,
    NotesModule,
    DocumentsModule,
    StudyModule,
    MemoryModule,
    SearchModule,
    GoogleSyncModule,
  ],
})
export class AppModule {}


