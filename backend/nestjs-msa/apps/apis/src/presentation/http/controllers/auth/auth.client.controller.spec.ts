import { Test, TestingModule } from "@nestjs/testing";
import { AuthClientController } from "./auth.client.controller";
import { AuthClientService } from "@apis/services/auth.client.service";
import { AuthCommandPort } from "@apis/core/ports/out/auth.command.port";
import { AuthGrpcClientAdapter } from "@apis/infrastructure/grpc/clients/auth/auth.grpc.client.adapter";

describe("AuthModuleController", () => {
  let controller: AuthClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthClientController],
      providers: [
        AuthClientService,
        { provide: AuthCommandPort, useClass: AuthGrpcClientAdapter },
      ],
    }).compile();

    controller = module.get<AuthClientController>(AuthClientController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
