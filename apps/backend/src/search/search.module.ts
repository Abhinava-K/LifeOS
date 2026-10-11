import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { NotesModule } from '../notes/notes.module';
import { PlannerModule } from '../planner/planner.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { DocumentsModule } from '../documents/documents.module';
import { StudyModule } from '../study/study.module';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [
    NotesModule,
    PlannerModule,
    ExpensesModule,
    DocumentsModule,
    StudyModule,
    MemoryModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
