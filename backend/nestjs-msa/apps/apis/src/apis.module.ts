import { Module } from '@nestjs/common';
import { ApisController } from './apis.controller';
import { ApisService } from './apis.service';

@Module({
  imports: [],
  controllers: [ApisController],
  providers: [ApisService],
})
export class ApisModule {}
