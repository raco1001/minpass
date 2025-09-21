import { Test, TestingModule } from "@nestjs/testing";
import { ActivitiesController } from "./activities.controller";
import { ActivitiesService } from "../../../services/activities.service";

describe("ActivitiesController", () => {
  let activitiesController: ActivitiesController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [ActivitiesService],
    }).compile();

    activitiesController = app.get<ActivitiesController>(ActivitiesController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(activitiesController.getHello()).toBe("Hello World!");
    });
  });
});
