import { Module } from "@nestjs/common";
import { LoginService } from "./login.service";
import { LoginServicePort } from "@auth/core/ports/in/login-service.port";
import { InfrastructureModule } from "@auth/infrastructure/infrastructure.module";

@Module({
  imports: [InfrastructureModule],
  providers: [
    { provide: LoginServicePort, useClass: LoginService },
    LoginService,
  ],
  exports: [LoginServicePort],
})
export class ServiceModule {}
