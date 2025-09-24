import { Module } from "@nestjs/common";

import { ApisController } from "./presentation/web/controllers/apis.controller";
import { ApisService } from "./services/apis.service";

@Module({
  imports: [],
  controllers: [ApisController],
  providers: [ApisService],
})
export class ApisModule {}
