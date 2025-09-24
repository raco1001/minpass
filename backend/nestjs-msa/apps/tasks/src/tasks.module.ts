import { Module } from "@nestjs/common";

import { TasksController } from "./presentation/web/controllers/tasks.controller";
import { TasksService } from "./services/tasks.service";

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
