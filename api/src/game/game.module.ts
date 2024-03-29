import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { DbWriterService } from 'src/db-writer/db-writer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room, User } from 'src/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from 'src/auth/auth.guard';
import { DbWriterRoomService } from 'src/db-writer-room/db-writer-room.service';
import { GatewayModule } from 'src/gateway/gateway.module';
import { DbWriterModule } from 'src/db-writer/db-writer.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([Room]), GatewayModule, DbWriterModule],
  providers: [
    GameGateway,
    GameService,
    DbWriterService,
    DbWriterRoomService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    
  ],
  controllers: [GameController],
  exports: [GameGateway, GameService],
})
export class GameModule {}
