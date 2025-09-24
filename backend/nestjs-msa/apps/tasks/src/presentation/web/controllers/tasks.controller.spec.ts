import { Test, TestingModule } from "@nestjs/testing";

import { TasksService } from "../../../services/tasks.service";

import { TasksController } from "./tasks.controller";

describe("TasksController", () => {
  let tasksController: TasksController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    }).compile();

    tasksController = app.get<TasksController>(TasksController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(tasksController.getHello()).toBe("Hello World!");
    });
  });
});
