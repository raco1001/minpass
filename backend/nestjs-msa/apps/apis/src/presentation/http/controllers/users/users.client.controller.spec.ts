import { Test, TestingModule } from "@nestjs/testing";

import { UsersClientController } from "./users.client.controller";
import { UsersClientService } from "@apis/services/users.client.service";

describe("UsersClientController", () => {
  let controller: UsersClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersClientController],
      providers: [UsersClientService],
    }).compile();

    controller = module.get<UsersClientController>(UsersClientController);
  });
  describe("createUser", () => {
    it("should create a user", () => {
      const user = {
        id: "1",
        name: "John Doe",
      };
    });
  });
  describe("findAllUsers", () => {
    it("should find all users", () => {
      const users = [{ id: "1", name: "John Doe" }];
    });
  });
  describe("findOneUser", () => {
    it("should find one user", () => {
      const user = { id: "1", name: "John Doe" };
    });
  });
  describe("updateUser", () => {
    it("should update a user", () => {
      const user = { id: "1", name: "John Doe" };
    });
  });
  describe("deleteUser", () => {
    it("should delete a user", () => {
      const user = { id: "1", name: "John Doe" };
    });
  });
});
