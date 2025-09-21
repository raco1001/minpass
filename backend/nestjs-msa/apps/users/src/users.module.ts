import { Module } from "@nestjs/common";
import { UsersController } from "./presentation/web/controllers/users.controller";
import { UsersService } from "./services/users.service";

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
