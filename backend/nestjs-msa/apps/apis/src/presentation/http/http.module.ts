import { Module } from "@nestjs/common";
import { UsersClientController } from "@apis/presentation/http/controllers/users/users.client.controller";
import { ServiceModule } from "@apis/services/service.module";
import { AuthClientController } from "@apis/presentation/http/controllers/auth/auth.client.controller";
import { AuthProviderModule } from "@apis/infrastructure/auth-provider/auth-provider.module";

@Module({
  imports: [ServiceModule, AuthProviderModule.register()],
  exports: [],
  providers: [],
  controllers: [UsersClientController, AuthClientController],
})
export class HttpModule {}
