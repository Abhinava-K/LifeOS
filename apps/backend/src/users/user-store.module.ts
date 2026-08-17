import { Module } from '@nestjs/common';
import { UserStoreService } from './user-store.service';

@Module({
  providers: [UserStoreService],
  exports: [UserStoreService],
})
export class UserStoreModule {}