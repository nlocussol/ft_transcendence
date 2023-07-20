import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room, User } from 'src/typeorm';
import { DbWriterRoomService } from 'src/db-writer-room/db-writer-room.service';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Room])],
    providers: [MyGateway, DbWriterService, DbWriterRoomService, GatewayService],
    exports: [GatewayService, MyGateway],
    controllers: [GatewayController]
})
export class GatewayModule  {}
