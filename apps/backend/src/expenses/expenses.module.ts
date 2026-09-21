import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, JwtAuthGuard],
  exports: [ExpensesService],
})
export class ExpensesModule {}
