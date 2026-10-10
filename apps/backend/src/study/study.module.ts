import { Module } from '@nestjs/common';
import { Sm2Service } from './services/sm2.service';
import { StudyService } from './services/study.service';
import { StudyController } from './study.controller';

@Module({
  controllers: [StudyController],
  providers: [Sm2Service, StudyService],
  exports: [Sm2Service, StudyService],
})
export class StudyModule {}
