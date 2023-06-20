import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { DbWriterService } from 'src/db-writer/db-writer.service';

@Module({
    providers: [MyGateway]
})
export class GatewayModule  { }
