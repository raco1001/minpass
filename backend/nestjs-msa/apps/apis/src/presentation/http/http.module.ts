import { Module } from "@nestjs/common";
import { UsersClientController } from "@apis/presentation/http/controllers/users/users.client.controller";
import { ServiceModule } from "@apis/services/service.module";

@Module({
  imports: [ServiceModule],
  exports: [],
  controllers: [UsersClientController],
})
export class HttpModule {}
