import { Controller, Post, Delete, Param, Get} from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {
    }

    @Post(':pseudo')
    addPlayerToQueue(@Param() params: any) {
        this.gameService.addPlayerToQueue(params.pseudo);
    }

    @Delete(':pseudo')
    removePlayerFromQueue(@Param() params: any) {
        this.gameService.removePlayerFromQueue(params.pseudo);
    }

    @Get(':pseudo')
    refreshQueue(@Param() params: any) {
        return this.gameService.refreshQueue(params.pseudo);
    }

    // @Get()
    // matchmaking(@Req() req: Request){
    //     return this.gameService.checkQueue(req.headers['playeruuid']);
    // }
}
