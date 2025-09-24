import { Test, TestingModule } from "@nestjs/testing";

import { ApisService } from "../../../services/apis.service";

import { ApisController } from "./apis.controller";

describe("ApisController", () => {
  let apisController: ApisController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApisController],
      providers: [ApisService],
    }).compile();

    apisController = app.get<ApisController>(ApisController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(apisController.getHello()).toBe("Hello World!");
    });
  });
});
