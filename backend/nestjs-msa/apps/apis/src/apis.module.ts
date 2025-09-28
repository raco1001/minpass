import { Module } from "@nestjs/common";

import { PresentationModule } from "./presentation/presentation.module";
import { ApisService } from "./services/apis.service";

@Module({
  imports: [PresentationModule],
  controllers: [],
  providers: [ApisService],
})
export class ApisModule {}
