import { Controller, Get, Param } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { SkipAuth } from 'src/utils/decorators';

@Controller('ping')
export class GatewayController {
  constructor(
    private gatewayService: GatewayService,
  ) {}

  @Get(':login')
  receiveUserPing(@Param('login') login: string) {
    this.gatewayService.updateUserStatusOnline(login);
  }

  @SkipAuth()
  @Get()
  Test() {
    return;
  }
}
