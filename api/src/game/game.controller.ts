import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('private-game')
  receivePrivateGameData(@Body() gameData: any) {
    this.gameService.createPrivateGame(gameData);
  }

  @Get(':login')
  getGame(@Param('login') login: string) {
    if (this.gameService.findGameUUIDWithLogin(login) != undefined) {
      return this.gameService.findGameUUIDWithLogin(login);
    } else {
      return ""
      // throw new HttpException('You are not in a game', HttpStatus.FORBIDDEN)
    }
  }
}
