import { Controller, Post, Delete, Param, Get} from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {
    }

    @Post(':login')
    addPlayerToQueue(@Param() params: any) {
        this.gameService.addPlayerToQueue(params.login);
    }

    @Delete(':login')
    removePlayerFromQueue(@Param() params: any) {
        this.gameService.removePlayerFromQueue(params.login);
    }

    @Get(':login')
    refreshQueue(@Param() params: any) {
        return this.gameService.refreshQueue(params.login);
    }

    // @Get()
    // matchmaking(@Req() req: Request){
    //     return this.gameService.checkQueue(req.headers['playeruuid']);
    // }
}
