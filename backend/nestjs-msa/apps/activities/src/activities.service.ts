import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivitiesService {
  getHello(): string {
    return 'Hello World!';
  }
}
