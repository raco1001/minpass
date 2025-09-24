import { Test, TestingModule } from "@nestjs/testing";

import { JournalsService } from "../../../services/journals.service";

import { JournalsController } from "./journals.controller";

describe("JournalsController", () => {
  let journalsController: JournalsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [JournalsController],
      providers: [JournalsService],
    }).compile();

    journalsController = app.get<JournalsController>(JournalsController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(journalsController.getHello()).toBe("Hello World!");
    });
  });
});
