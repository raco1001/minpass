import { Module } from "@nestjs/common";

import { JournalsController } from "./presentation/grpc/controllers/journals.controller";
import { JournalsService } from "./services/journals.service";

@Module({
  imports: [],
  controllers: [JournalsController],
  providers: [JournalsService],
})
export class JournalsModule {}
