import { Module } from "@nestjs/common";
import { ActivitiesController } from "./presentation/web/controllers/activities.controller";
import { ActivitiesService } from "./services/activities.service";

@Module({
  imports: [],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
