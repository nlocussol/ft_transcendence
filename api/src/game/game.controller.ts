import { Controller, Post, Body, Delete, Req, Headers } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayerUUID } from './models/player-uuid.model';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {

    }

    @Post()
    addPlayerToQueue(@Body() body: PlayerUUID) {
        // console.log(body.UUID)
        this.gameService.addToQueue(body.UUID);
    }

    @Delete()
    removePlayerFromQueue(@Req() req: Request) {
        // console.log("To remove => " + req.headers['player-to-remove'])
        this.gameService.removeFromQueue(req.headers['player-to-remove'])
    }
}
