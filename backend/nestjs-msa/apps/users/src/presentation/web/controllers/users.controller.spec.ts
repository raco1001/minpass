import { Test, TestingModule } from "@nestjs/testing";

import { UsersService } from "../../../services/users.service";

import { UsersController } from "./users.controller";

describe("UsersController", () => {
  let usersController: UsersController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
  });

  describe("root", () => {});
});
