import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [MyGateway, DbWriterService]
})
export class GatewayModule  {}
