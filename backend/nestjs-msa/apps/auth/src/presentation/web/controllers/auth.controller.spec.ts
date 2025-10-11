import { Test, TestingModule } from "@nestjs/testing";

import { LoginService } from "@auth/services/login.service";

import { AuthController } from "./auth.controller";

describe("AuthController", () => {
  let authController: AuthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [LoginService],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(
        authController.socialLogin({ provider: "google", code: "code" }),
      ).toBe("Hello World!");
    });
  });
});
