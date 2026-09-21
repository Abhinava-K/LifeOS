import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiGatewayModule } from './ai-gateway/ai-gateway.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ExpensesModule } from './expenses/expenses.module';
import { UsersModule } from './users/users.module';
import { PlannerModule } from './planner/planner.module';
import { NotesModule } from './notes/notes.module';

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
  ],
})
export class AppModule {}

