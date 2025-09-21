import { Controller, Get } from "@nestjs/common";
import { ActivitiesService } from "../../../services/activities.service";

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  getHello(): string {
    return this.activitiesService.getHello();
  }
}
