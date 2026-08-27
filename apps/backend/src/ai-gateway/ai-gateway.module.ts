import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AiGatewayController } from './ai-gateway.controller';
import { AiRouterService } from './services/ai-router.service';
import { SessionManagerService } from './services/session-manager.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AiGatewayController],
  providers: [AiRouterService, SessionManagerService],
  exports: [AiRouterService, SessionManagerService],
})
export class AiGatewayModule {}
