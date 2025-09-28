import { Controller, Get } from "@nestjs/common";

import { SchedulesService } from "../../../services/schedules.service";

@Controller()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getHello(): string {
    return this.schedulesService.getHello();
  }
}
