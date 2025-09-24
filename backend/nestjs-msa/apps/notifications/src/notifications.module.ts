import { Module } from "@nestjs/common";

import { NotificationsController } from "./presentation/web/controllers/notifications.controller";
import { NotificationsService } from "./services/notifications.service";

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
