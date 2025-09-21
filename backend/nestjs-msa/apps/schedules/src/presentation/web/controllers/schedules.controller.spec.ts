import { Test, TestingModule } from "@nestjs/testing";
import { SchedulesController } from "./schedules.controller";
import { SchedulesService } from "./services/schedules.service";

describe("SchedulesController", () => {
  let schedulesController: SchedulesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [SchedulesController],
      providers: [SchedulesService],
    }).compile();

    schedulesController = app.get<SchedulesController>(SchedulesController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(schedulesController.getHello()).toBe("Hello World!");
    });
  });
});
