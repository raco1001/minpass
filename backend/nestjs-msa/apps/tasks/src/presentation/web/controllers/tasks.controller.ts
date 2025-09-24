import { Controller, Get } from "@nestjs/common";

import { TasksService } from "../../../services/tasks.service";

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getHello(): string {
    return this.tasksService.getHello();
  }
}
