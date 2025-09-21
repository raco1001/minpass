import { Module } from "@nestjs/common";
import { SchedulesController } from "./presentation/web/controllers/schedules.controller";
import { SchedulesService } from "./services/schedules.service";

@Module({
  imports: [],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
