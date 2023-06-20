import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room, User } from 'src/typeorm';
import { DbWriterRoomService } from 'src/db-writer-room/db-writer-room.service';

@Module({
    imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Room])],
    providers: [MyGateway, DbWriterService, DbWriterRoomService]
})
export class GatewayModule  {}
