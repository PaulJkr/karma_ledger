import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<any, string> {
    return { msg: 'server is up' };
  }
}
