import { Injectable } from '@nestjs/common';

@Injectable()
export class JournalsService {
  getHello(): string {
    return 'Hello World!';
  }
}
