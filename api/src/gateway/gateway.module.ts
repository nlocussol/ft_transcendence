import { Module, OnModuleInit } from '@nestjs/common';
import { MyGateway } from './gateway';

@Module({
    providers: [MyGateway]
})
export class GatewayModule  { }
