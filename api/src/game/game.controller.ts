import { Body, Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private gameService: GameService) {
    }

    @Post('private-game')
    receivePrivateGameData(@Body() gameData: any) {
        const newGame = this.gameService.createNewGame()
        newGame.players[0].login = gameData.player1
        newGame.players[1].login = gameData.player2
    }
}
