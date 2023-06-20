import { Controller, Post, Body, Delete, Req, Get, Param, Patch } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayerUUID } from './models/player-uuid.model';
import { Player } from './models/game.models';

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

    @Get()
    matchmaking(@Req() req: Request){
        return this.gameService.checkQueue(req.headers['playeruuid']);
    }
}
