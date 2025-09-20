import { Controller, Get } from '@nestjs/common';
import { ActivitiesService } from './activities.service';

@Controller()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  getHello(): string {
    return this.activitiesService.getHello();
  }
}
