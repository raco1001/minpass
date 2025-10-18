import { Module } from "@nestjs/common";
import { UsersClientController } from "@apis/presentation/http/controllers/users/users.client.controller";
import { ServiceModule } from "@apis/services/service.module";
import { AuthClientController } from "@apis/presentation/http/controllers/auth/auth.client.controller";

@Module({
  imports: [ServiceModule],
  exports: [],
  controllers: [UsersClientController, AuthClientController],
})
export class HttpModule {}
