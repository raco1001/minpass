import { Controller, Get } from '@nestjs/common';
import { ApisService } from './apis.service';

@Controller()
export class ApisController {
  constructor(private readonly apisService: ApisService) {}

  @Get()
  getHello(): string {
    return this.apisService.getHello();
  }
}
