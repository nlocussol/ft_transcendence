import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  providers: [GameGateway, GameService, GameController],
  controllers: [GameController],
  exports: [GameGateway, GameService]
})
export class GameModule {}
