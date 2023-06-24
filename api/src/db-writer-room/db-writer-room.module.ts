import { Module } from '@nestjs/common';
import { DbWriterRoomService } from './db-writer-room.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DbWriterRoomController } from './db-writer-room.controller';
import { Room } from 'src/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Room])],
  providers: [DbWriterRoomService],
  controllers: [DbWriterRoomController]
})
export class DbWriterRoomModule {}
